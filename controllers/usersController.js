const User = require('../models/userModel')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')
const factory = require('./handlerFactory')

module.exports.getUsers = factory.getAll(User)

module.exports.getUserById = factory.getOne(User)

module.exports.createUser = factory.createOne(User)

module.exports.editUserParamById = factory.updateOne(User)

module.exports.deleteUser = factory.deleteOne(User)

module.exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user._id

    if (!req.params.id) {
        return next(
            new AppError(`User is not logged in`),
            404
        )
    }
    next()
})
