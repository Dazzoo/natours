
module.exports.requiredParams = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: "bad request"
        })
    }
    console.log(!req.body.price)
    next()
}