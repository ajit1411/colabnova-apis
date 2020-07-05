const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const mongoose = require('mongoose')
const constants = require('../../../Constants')
require('dotenv').config()

// Fetch all the project data
ROUTER.get('/', (req, res, next) => {
    res.status(constants.statusCodes.OK).json({
        'message': 'Organization is working'
    })
})

module.exports = ROUTER