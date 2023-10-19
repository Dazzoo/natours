const multer = require('multer')
const sharp = require('sharp') // Import sharp library
const AppError = require('../appError')

const parseFieleType = (originalname) => {
    const array = originalname.split('.')
    const type = `.${array[array.length - 1]}`
    return type
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `public/img/user-photo`) // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${req.user._id}` +
                `-${Date.now()}${parseFieleType(file.originalname)}`
        ) // Generate a unique filename
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit (adjust as needed)
    },
    fileFilter: function (req, file, cb) {
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg'
        ) {
            cb(null, true) // Accept the file
        } else {
            cb(new Error('Only JPEG and PNG files are allowed.'), false) // Reject the file
        }
    },
}).single('photo') // Assuming you are uploading a single image

// Middleware to handle image upload and resizing
const uploadAndResizeUserImage = (height, width) => (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return next(new AppError('File upload failed.'), 400)
        }

        if (!req.file) {
            return next(new AppError('No file uploaded.'), 400)
        }

        try {
            // Use Sharp to check the image dimensions
            const imageInfo = await sharp(req.file.path).metadata()

            if (imageInfo.width < width || imageInfo.height < height) {
                return next(
                    new AppError(
                        `Image dimensions must be at least ${width}x${height} pixels.`
                    ),
                    400
                )
            }

            const resizedBuffer = await sharp(req.file.path)
                .resize(width, height)
                .toBuffer()

            // Replace the original file with the resized one
            await sharp(resizedBuffer).toFile(req.file.path)

            next() // Continue with the next middleware or route handler
        } catch (error) {
            return next(
                new AppError('An error occurred while processing the image.'),
                500
            )
        }
    })
}

module.exports = { uploadAndResizeUserImage }
