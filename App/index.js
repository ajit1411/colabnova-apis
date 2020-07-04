const express = require('express')
const App = express()
const constantsVariables = require('./../Constants')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

App.use(bodyParser.urlencoded({ urlencoded: false }))
App.use(bodyParser.json({}))

// Connect to MongoDB database using Mongoose
mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })

// Handle CORS
App.use((req, res, next) => {
    // Set allowed origins
    res.header('Access-Control-Allow-Origin', '*')
    // Set allowed headers
    res.header('Access-Control-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
        return res.status(constantsVariables.statusCodes.OK).json({})
    }
    // To proceed with the incoming request with next() function
    // If not used, all the incoming requests are blocked
    next()
})

// Import routes
const ProductApi = require('./../apis/routes/Product')
const OrdersApi = require('./../apis/routes/Orders')

App.use('/products', ProductApi)
App.use('/orders', OrdersApi)

App.use((req, res, next) => {
    const error = new Error('Not found')
    error.status = constantsVariables.statusCodes.notFound
    next(error)
})

// Error handler
App.use((error, req, res, next) => {
    res.status(error.status || constantsVariables.statusCodes.serverError).json({
        'error': {
            'message': error.message
        }
    })
})

module.exports = App