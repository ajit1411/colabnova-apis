const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const utilities = require('./../Utilities')
const constants = require('./../../../Constants')
const mongo = require('mongodb').MongoClient
require('dotenv').config()


/* ------------------------------- GET REQUESTS ------------------------------- */

ROUTER.get('/all', (req, res, next) => {
    utilities.getDocuments('colabnova', 'users')
        .then(result => {
            res.status(200).json({
                'data': result
            })
        })
        .catch(error => {
            res.status(504).json({
                'data': error
            })
        })
})

// Get user details
ROUTER.get('/', (req, res, next) => {
    const userId = req.query.userId
    res.status(200).json({
        'userDetails': userId
    })
})


/* ------------------------------- POST REQUESTS ------------------------------- */

// Create a user
ROUTER.post('/new', (req, res, next) => {
    const userData = req.body
    userData['userId'] = 'COLAB-' +  (Math.ceil(Math.random() * 10000000000000)).toString()
    utilities.insertData('colabnova', 'users', userData)
        .then(result => {
            res.status(constants.statusCodes.created).json({
                'message': userData
            })
        })
        .catch(error => {
            let err = new Error(error)
            err['status'] = constants.statusCodes.serverError
            next(err)
        })
})

/* ------------------------------- DELETE ------------------------------- */
ROUTER.delete('/', (req, res, next) => {
    const identifiers = {
        'email': req.body.email
    }
    mongo.connect('mongodb://localhost:27017', (error, dbClient) => {
        if (error) {
            res.status(501).json({
                'message': error
            })
        }
        else {
            const database = dbClient.db('colabnova')
            database.collection('users').deleteOne(identifiers, (error, result) => {
                if (error) {
                    res.status(501).json({
                        'message': error
                    })
                }
                else {
                    res.status(200).json({
                        'message': result
                    })
                }
            })
        }

    })
})

module.exports = ROUTER