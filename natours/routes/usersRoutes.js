const express = require('express')
const usersController = require('../controllers/usersController')
const authController = require('../controllers/authController')

const usersRouter = express.Router()

usersRouter.post('/signup', authController.signup)

usersRouter
    .route('/')
    .get(usersController.getUsers)
    .post(usersController.createUser)

usersRouter
    .route('/:id')
    .get(usersController.getUserById)
    .patch(usersController.editUserParamById)
    .delete(usersController.deleteUser)

module.exports = usersRouter
