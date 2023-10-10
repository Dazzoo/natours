const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const AppError = require('../appError')

const parseFieleType = (originalname) => {
    const array = originalname.split('.')
    const type = `.${array[array.length - 1]}`
    return type
}

const storage = multer.memoryStorage()

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
const uploadToFileAndResizeTourImages = (width, height) => (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                error: 'Files upload failed.',
                message: err.messageя,
            })
        }

        if (!req.files) {
            next()
        }

        try {
            // Use Sharp to check the image dimensions
            if (req.files.images) {
                req.images = []
                await req.files.images.forEach(async (file, index) => {
                    const imageInfo = await sharp(file.buffer).metadata()
                    // if (imageInfo.width < width || imageInfo.height < height) {
                    //     return next(
                    //         new AppError(
                    //             `Image dimensions must be at least ${width}x${height} pixels.`
                    //         ),
                    //         400
                    //     )
                    // }

                    const fileName = `tour-${req.params.id}-${Date.now()}-${
                        index + 1
                    }.jpeg`
                    req.images.push(fileName)
                    await sharp(file.buffer)
                        .resize(width, height)
                        .toFormat('jpeg')
                        .jpeg({ quality: 90 })
                        .toFile(`public/img/tours/${fileName}`)
                    // .toBuffer()
                    // .then((resizedBuffer) => {
                    //     req.files.images[index].buffer = resizedBuffer // Update the buffer with the resized image buffer
                    // })
                })
            }
            if (req.files.imageCover[0]) {
                const imageInfo = await sharp(
                    req.files.imageCover[0].buffer
                ).metadata()
                // if (imageInfo.width < width || imageInfo.height < height) {
                //     return next(
                //         new AppError(
                //             `Image dimensions must be at least ${width}x${height} pixels.`
                //         ),
                //         400
                //     )
                // }
                req.imageCover = `tour-${
                    req.params.id
                }-${Date.now()}-cover.jpeg`
                await sharp(req.files.imageCover[0].buffer)
                    .resize(width, height)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/tours/${req.imageCover}`)
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

module.exports = { uploadToFileAndResizeTourImages }
