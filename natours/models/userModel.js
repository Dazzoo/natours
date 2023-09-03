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
            validator: function (val) {
                console.log(
                    'validator',
                    validator.isStrongPassword(val, {
                        minLength: 8,
                        minNumbers: 1,
                    })
                )
                return !validator.isStrongPassword(val, {
                    minLength: 8,
                    minNumbers: 1,
                })
            },
            message: `The password must contain at least 8 characters, including one number`,
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
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})

userSchema.pre('save', async function (next) {
    console.log(
        await Promise.all(
            [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21, 22, 23, 24, 25,
            ].map(async (n) => await bcrypt.hash('qwerty123', 12))
        )
    )
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt = Date.now() - 2000
    next()
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
