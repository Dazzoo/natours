const catchAsync = require('../utility/catchAsync')
const User = require('../models/userModel')
const AppError = require('../utility/appError')
const jwt = require('jsonwebtoken')

module.exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body)

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
