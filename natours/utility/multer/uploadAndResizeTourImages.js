const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const AppError = require('../appError')

const parseFieleType = (originalname) => {
    const array = originalname.split('.')
    const type = `.${array[array.length - 1]}`
    return type
}

const storage = multer.memoryStorage();


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, `public/img/tours`) // Specify the directory where uploaded files will be stored
//     },
//     filename: function (req, file, cb) {
//         const fileNumber =
//             file.fieldname === 'imageCover' ? 'cover' : req.files.images.length
//         const filename =
//             `tour-${req.params.id}` +
//             `-${fileNumber}${parseFieleType(file.originalname)}`
//         cb(null, filename) // Generate a unique filename
//     },
// })

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 25, // 25MB limit (adjust as needed)
    },
    fileFilter: async function (req, file, cb) {
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
}).fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
])

// Middleware to handle image upload and resizing
const uploadAndResizeTourImages = (width, height) => (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res
                .status(400)
                .json({ error: 'Files upload failed.', message: err.messageя })
        }

        if (!req.files) {
            return res.status(400).json({ error: 'No files uploaded.' })
        }

        try {
            // Use Sharp to check the image dimensions
            if (req.files.images) {
                req.files.images.forEach(async (file, index) => {
                    const imageInfo = await sharp(file.buffer).metadata()
                    if (imageInfo.width < width || imageInfo.height < height) {
                        return next(
                            new AppError(
                                `Image dimensions must be at least ${width}x${height} pixels.`
                            ),
                            400
                        )
                    }
                    sharp(file.buffer)
                        .resize(width, height)
                        .toBuffer()
                        .then((resizedBuffer) => {
                            req.files.images[index].buffer = resizedBuffer // Update the buffer with the resized image buffer
                        })
                    //  const resizedBuffer = await sharp(file.buffer)
                    //     .resize(width, height)
                    //     .toBuffer()
                    // // Replace the original fil'e with the resized one
                    // await sharp(resizedBuffer).toFile(
                    //     req.files.images[index].buffer
                    // )
                })
            }
            if (req.files.imageCover[0]) {
                const imageInfo = await sharp(
                    req.files.imageCover[0].buffer
                ).metadata()
                if (imageInfo.width < width || imageInfo.height < height) {
                    return next(
                        new AppError(
                            `Image dimensions must be at least ${width}x${height} pixels.`
                        ),
                        400
                    )
                }
                sharp(req.files.imageCover[0].buffer)
                    .resize(width, height)
                    .toBuffer()
                    .then((resizedBuffer) => {
                        req.files.imageCover[0].buffer = resizedBuffer // Update the buffer with the resized image buffer
                    })
            }

            next() // Continue with the next middleware or route handler
        } catch (error) {
            console.error('Error:', error.message) // Log the error message
            return res.status(500).json({
                error: 'An error occurred while processing the image.',
            })
        }
    })
}

module.exports = { uploadAndResizeTourImages }
