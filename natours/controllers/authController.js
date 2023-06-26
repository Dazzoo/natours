const catchAsync = require('../utility/catchAsync')
const User = require('../models/userModel')
const AppError = require('../utility/appError')

module.exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    })
})
