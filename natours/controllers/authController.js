const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const crypto = require('crypto')
const User = require('../models/userModel')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')
const { sendEmail, emailResetMessageText } = require('../utility/email')
const { env } = require('process')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
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

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    })

    res.status(201).json({
        status: 'success',
        token,
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

    const token = signToken(user._id)

    res.status(201).json({
        status: 'success',
        token,
    })
})

module.exports.protect = catchAsync(async (req, res, next) => {
    // CHECK IF TOKEN I THERE
    const token = req.headers.token
    console.log('token', token)
    console.log('headers', req.headers)

    if (!token) {
        return next(new AppError('Authorisation error'), 401)
    }

    // VERIFY TOKEN

    const decodeAsync = promisify(jwt.verify)

    const decode = await decodeAsync(token, process.env.JWT_SECRET)

    // CHECK IF USER IS STILL EXISTS

    const currentUser = await User.findById(decode.id)

    if (!currentUser) {
        return next(
            new AppError(
                'User belonging to this token does not longer exist',
                401
            )
        )
    }

    // CHECK IF USER PASSWORD CHANGED AFTER TOKENN ISSUED
    if (currentUser.changedPasswordAfter(decode.iat)) {
        console.log(currentUser.changedPasswordAfter(decode.iat))
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
        console.log('HERE', !roles.includes(req.user.role))
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
    console.log('resetToken', resetToken)
    const resetTokenEncrypted = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    console.log('resetTokenEncrypted', resetTokenEncrypted)

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

    const token = signToken(user._id)

    res.status(200).json({
        message: 'success',
        token,
    })
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
    console.log(user)

    user.password = req.body.passwordNew
    user.passwordConfirm = req.body.passwordConfirmNew
    user.passwordChangedAt = Date.now() - 2000
    await user.save()

    const newToken = signToken(user._id)

    res.status(200).json({
        message: 'success',
        token: newToken,
    })
})
