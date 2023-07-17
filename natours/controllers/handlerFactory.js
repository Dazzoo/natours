const catchAsync = require('../utility/catchAsync')
const AppError = require('../utility/appError')

module.exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id

        const doc = await Model.findByIdAndDelete(id)

        if (!doc) {
            return next(
                new AppError(`Document with ID: ${id} is not found`),
                404
            )
        }

        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                data: doc,
            },
        })
    })
