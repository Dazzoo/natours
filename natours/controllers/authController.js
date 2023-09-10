const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const crypto = require('crypto')
const multer = require('multer')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')
const filterObject = require('../utility/filterObject')
const { sendEmail, emailResetMessageText } = require('../utility/email')
const User = require('../models/userModel')
const { createClient } = require('redis')
const { serialize, parse } = require('cookie')

const redisClient = createClient({
    socket: {
        host: 'localhost',
        port: 6379,
        tls: process.env.NODE_ENVIROMENT === 'production',
    },
})

const redisStart = async function () {
    redisClient.on('error', (err) => console.log('Redis Client Error', err))

    await redisClient.connect()
}

redisStart()

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    })
}

const createSendToken = (statusCode, user, res, req) => {
    const token = signToken(user.id)

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }

    if (process.env.NODE_ENVIROMENT === 'production') {
        cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user,
        },
    })
}

module.exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        photo: req.body.photo,
    })
    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    })
})

module.exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError('Please provide email and passsword'), 400)
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password'), 401)
    }

    createSendToken(201, user, res, req)
})

module.exports.logout = catchAsync(async (req, res, next) => {
    if (!req.token) {
        return next(new AppError('You are not logged in'), 400)
    }
    const token = req.token
    const userId = req.user.id

    const blacklist = await redisClient.get(userId)

    if (blacklist !== null) {
        const parsedData = JSON.parse(blacklist)
        parsedData[userId].push(token)
        await redisClient.set(userId, JSON.stringify(parsedData))
        return res.send({
            status: 'success',
            message: 'Logout successful',
        })
    }

    const blacklistData = {
        [userId]: [token],
    }
    await redisClient.set(userId, JSON.stringify(blacklistData))
    return res.send({
        status: 'success',
        message: 'Logout successful',
    })
})

module.exports.protect = catchAsync(async (req, res, next) => {
    // CHECK IF TOKEN I THERE

    const token = req.cookies.jwt || req.headers.token

    if (!token) {
        return next(new AppError('Authorisation error'), 401)
    }
    req.token = token

    // VERIFY TOKEN

    const decodeAsync = promisify(jwt.verify)

    const decode = await decodeAsync(token, process.env.JWT_SECRET)

    // CHECK IF USER IS STILL EXISTS

    const currentUser = await User.findById(decode.id).select('+password')

    if (!currentUser) {
        return next(new AppError('Authorisation error', 401))
    }
    // CHECK IF TOKEN IS NOT BLACKLISTED

    const blacklist = await redisClient.get(currentUser?.id)

    // 3. if so, check if the token provided in the request has been blacklisted. If so, redirect or send a response else move on with the request.
    if (blacklist !== null) {
        const parsedData = JSON.parse(blacklist)

        if (parsedData[currentUser?.id].includes(token)) {
            return next(new AppError('Authorisation error', 401))
        }
    }

    // CHECK IF USER PASSWORD CHANGED AFTER TOKENN ISSUED
    if (currentUser.changedPasswordAfter(decode.iat)) {
        return next(
            new AppError(
                'User recently changed password, please log in again',
                401
            )
        )
    }

    // GRAND ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    next()
})

module.exports.PermitOnlyTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'User does not have permission to use this route',
                    403
                )
            )
        }
        next()
    }
}

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
    const email = req.body.email
    const user = await User.findOne({ email })

    if (!user) {
        return next(
            new AppError('There is no user with this email address'),
            404
        )
    }

    const resetToken = user.changedPasswordResetToken()

    await user.save({ validateBeforeSave: false })

    try {
        const emailResult = await sendEmail({
            email: email,
            subject: 'Password Reset Instructions',
            message: emailResetMessageText({
                name: user.name,
                link: `${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}`,
            }),
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        })
    } catch (err) {
        console.log(err)
        user.passwordResetToken = undefined
        user.passwordResetExpiresAt = undefined
        await user.save({ validateBeforeSave: false })

        return next(
            new AppError(
                'There was an error sending email. Please try again later',
                500
            )
        )
    }

    next()
})

module.exports.resetPassword = catchAsync(async (req, res, next) => {
    const resetToken = req.params.token
    const resetTokenEncrypted = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await User.findOne({
        passwordResetToken: resetTokenEncrypted,
        passwordResetExpiresAt: { $gt: Date.now() },
    })

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpiresAt = undefined
    await user.save()

    createSendToken(201, user, res)
})

module.exports.updatePassword = catchAsync(async (req, res, next) => {
    const token = req.headers.token

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findOne({ _id: decoded.id }).select('+password')

    if (
        !user ||
        !(await user.correctPassword(req.body.password, user.password))
    ) {
        return next(
            new AppError('User password is wrong or token has expired'),
            400
        )
    }

    user.password = req.body.passwordNew
    user.passwordConfirm = req.body.passwordConfirmNe
    user.passwordChangedAt = Date.now() - 2000
    await user.save()

    const newToken = signToken(user._id)

    res.status(200).json({
        message: 'success',
        token: newToken,
    })
})

module.exports.updateMe = catchAsync(async (req, res, next) => {
    const filteredRequest = filterObject(req.body, 'name', 'email')

    if (
        !(await req.user.correctPassword(req.body.password, req.user.password))
    ) {
        console.log('here')
        return next(new AppError('Not correct password'), 400)
    }

    const newUser = await User.findByIdAndUpdate(req.user.id, filteredRequest, {
        runValidators: true,
        new: true,
    })

    res.status(200).json({
        message: 'success',
        data: {
            user: newUser,
        },
    })
})

module.exports.updatePhoto = catchAsync(async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' })
        }
        const user = await User.findOne({ _id: req.user._id })

        user.photo = {
            data: req.file.buffer,
            path: req.file.path,
            contentType: req.file.mimetype,
        }

        // Save the document to MongoDB
        console.log(user)
        await user.save({ validateBeforeSave: false })

        res.status(201).json({ message: 'File uploaded successfully.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error.' })
    }
})

module.exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        active: false,
    })

    res.status(200).json({
        message: 'success',
        data: {
            user: user,
        },
    })
})
