const express = require('express')
const usersController = require('../controllers/usersController')
const authController = require('../controllers/authController')
const upload = require('../utility/multer-config')

const usersRouter = express.Router()

usersRouter.post('/signup', authController.signup)
usersRouter.post('/login', authController.login)
usersRouter.get('/logout', authController.protect, authController.logout)
usersRouter.post('/forgot-password', authController.forgotPassword)
usersRouter.patch('/reset-password/:token', authController.resetPassword)

usersRouter.use(authController.protect)

usersRouter.post(
    '/update-photo',
    upload.single('photo'),
    authController.updatePhoto
)

usersRouter.patch('/update-password', authController.updatePassword)
usersRouter.patch('/update-info', authController.updateMe)

usersRouter.delete('/delete-me', authController.deleteMe)

usersRouter.get('/me', usersController.getMe, usersController.getUserById)

usersRouter.use(authController.PermitOnlyTo('admin'))

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
