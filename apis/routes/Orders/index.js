const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()


// Create methods and corresponding paths
ROUTER.get('/', (req, res, next) => {
    res.status(200).json({
        'message': 'Orders fetched using GET method'
    })
})

ROUTER.post('/', (req, res, next) => {
    res.status(201).json({
        'message': 'Order created using POST method'
    })
})

module.exports = ROUTER