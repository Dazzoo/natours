const User = require('../models/userModel')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')
const factory = require('./handlerFactory')

module.exports.getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        data: {
            users: users,
        },
    })
})

module.exports.getUserById = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined',
    })
}

module.exports.createUser = factory.createOne(User)

module.exports.editUserParamById = factory.updateOne(User)

module.exports.deleteUser = factory.deleteOne(User)
