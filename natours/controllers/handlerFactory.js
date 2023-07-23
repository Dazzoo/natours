const catchAsync = require('../utility/catchAsync')
const AppError = require('../utility/appError')
const APIFeatures = require('../utility/apiFeatures')
const { populate } = require('../models/userModel')

module.exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // FOR REVIES NESTED ROUTE
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .select()
            .pagination()

        // const doc = await features.query.explain()
        const doc = await features.query

        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                data: doc,
            },
        })
    })

module.exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id

        let doc = await Model.findById(id)

        if (populateOptions) {
            doc = await doc.populate(populateOptions)
        }
        // .populate({ path: 'reviews' })

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

module.exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body)
        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            data: {
                data: doc,
            },
        })
    })

module.exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id

        const doc = await Model.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
            runValidators: true,
        })

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

module.exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id

        const doc = await Model.findOneAndDelete({ _id: id })

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
