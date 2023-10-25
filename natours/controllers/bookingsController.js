const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utility/catchAsync')
const AppError = require('../utility/appError')
const factory = require('./handlerFactory')

module.exports.createCheckoutSession = catchAsync(async (req, res, next) => {
    const tourId = req.params.tourId

    const tour = await Tour.findOne({ _id: tourId })

    if (!tour) {
        return next(new AppError('Tour for such and id is not found', 400))
    }

    const product = await stripe.products.create({
        name: tour.name,
        images: [`${process.env.BASE_URL}/img/tours/${tour.imageCover.path}`],
        description: tour.summary,
    })

    const price = await stripe.prices.create({
        unit_amount: tour.price * 100, // Set the price amount in cents or smallest currency unit
        currency: 'usd',
        product: product.id,
    })

    const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.FRONTEND_URL}/payment/success?tourId=${tour._id}&userId=${req.user.id}&price=${tour.price}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        payment_method_types: ['card'],
        customer_email: req.user.email,
        client_reference_id: tourId,
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        mode: 'payment',
    })

    res.status(200).json({
        message: 'success',
        data: session,
    })
})

module.exports.createBooking = factory.createOne(Booking)
