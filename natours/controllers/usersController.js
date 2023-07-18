const User = require('../models/userModel')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')
const factory = require('./handlerFactory')

module.exports.getUsers = factory.getAll(User)

module.exports.getUserById = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined',
    })
}

module.exports.createUser = factory.createOne(User)

module.exports.editUserParamById = factory.updateOne(User)

module.exports.deleteUser = factory.deleteOne(User)
