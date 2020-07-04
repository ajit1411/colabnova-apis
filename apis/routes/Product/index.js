const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const constantVariables = require('./../../../Constants')
const Product = require('./../../Models/Product')
const mongoose = require('mongoose')
require('dotenv').config()

// Fetch general data
ROUTER.get('/', (req, res, next) => {
    res.status(200).json({
        'message': 'Product fetched using GET method',
        'data': {
            'name': 'Ajit Jadhav',
            'emailId': 'ajitjadhav2310@outlook.com',
            'contactNUmber': '+918446460616'
        }
    })
})

// Fetch productId based data
ROUTER.get('/:productId', (req, res, next) => {
    const productId = req.params.productId
    Product.find()
        .exec()
        .then(document => {
            console.log(res)
            res.status(constantVariables.statusCodes.OK).json({
                'status': 'success',
                'data': document
            })
        })
        .catch(err => {
            console.error(err)
            res.status(constantVariables.statusCodes.serverError).json({
                'status': 'failed',
                'message': `No data found for ${productId}`
            })
        })
})


// Add new product to the database
ROUTER.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })
    // Dump the data to database
    product
        .save()
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
            const error = new Error()
            error.status = constantVariables.statusCodes.serverError
            next(error)
        })
    res.status(constantVariables.statusCodes.created).json({
        'status': 'success',
        'data': product
    })
})

module.exports = ROUTER