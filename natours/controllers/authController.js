const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const User = require('../models/userModel')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')

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
        role: req.body.role,
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
