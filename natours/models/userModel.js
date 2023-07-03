const mongoose = require('mongoose')
const crypto = require('crypto')
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
        select: false,
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
    role: {
        type: String,
        enum: ['admin', 'lead-guide', 'guide', 'user'],
        default: 'user',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
})

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const userTimestamp = this.passwordChangedAt.getTime() / 1000
        console.log(userTimestamp, JWTTimestamp)
        return JWTTimestamp < userTimestamp
    }
    return false
}

userSchema.methods.changedPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpiresAt = new Date(
        new Date().getTime() +
            process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN * 60000
    )

    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
