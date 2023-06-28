const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        minlength: [3, 'A user name must have more or equal than 3 character'],
        maxlength: [
            20,
            'A user name must have less or equal than 20 character',
        ],
    },
    email: {
        type: String,
        required: [true],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'An email is not valid',
        },
    },
    password: {
        type: String,
        required: [true],
        validate: {
            validator: validator.isStrongPassword,
            message: `The password must contain at least 8 characters, including one lowercase letter, one uppercase letter, one number, and one symbol.`,
        },
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return val === this.password
            },
            message: `The password confirmation does not match the password.`,
        },
    },
    photo: {
        data: {
            type: Buffer,
            required: false,
        },
        contentType: {
            type: String,
            required: false,
        },
    },
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
})

const User = mongoose.model('User', userSchema)

module.exports = User
