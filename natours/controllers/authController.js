const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
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
