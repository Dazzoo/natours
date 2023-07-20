const express = require('express')
const usersController = require('../controllers/usersController')
const authController = require('../controllers/authController')

const usersRouter = express.Router()

usersRouter.post('/signup', authController.signup)
usersRouter.post('/login', authController.login)
usersRouter.post('/forgot-password', authController.forgotPassword)
usersRouter.patch('/reset-password/:token', authController.resetPassword)
usersRouter.patch(
    '/update-password',
    authController.protect,
    authController.updatePassword
)
usersRouter.patch(
    '/update-info',
    authController.protect,
    authController.updateMe
)

usersRouter.delete(
    '/delete-me',
    authController.protect,
    authController.deleteMe
)

usersRouter.get(
    '/me',
    authController.protect,
    usersController.getMe,
    usersController.getUserById
)

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
