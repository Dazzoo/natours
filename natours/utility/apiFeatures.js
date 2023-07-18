const Tour = require('../models/tourModel')

class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        // 1) Filtering
        let queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach((el) => delete queryObj[el])
        // 2) Advanced filtering
        let queryString = JSON.stringify(queryObj)
        queryString = queryString.replace(
            /\b(gte|gt|lt|lte)\b/g,
            (match) => `$${match}`
        )
        console.log('queryString', queryString)
        this.query = this.query.find(JSON.parse(queryString))
        return this
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
            console.log('1')
        } else {
            this.query = this.query.sort('createdAt')
            console.log('2')
        }
        return this
    }

    select() {
        if (this.queryString.fields) {
            let fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }
        return this
    }

    pagination() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)

        if (this.queryString.page) {
            const countDocuments = this.query.countDocuments()
            if (skip >= countDocuments)
                throw Error(`Page ${page} does not exist`)
        }
        return this
    }
}

module.exports = APIFeatures
