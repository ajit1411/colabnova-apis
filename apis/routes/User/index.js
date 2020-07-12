const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const utilities = require('./../Utilities')
const constants = require('./../../../Constants')
const mongo = require('mongodb').MongoClient
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AuthorizationMiddleWare = require('./../../../App/MiddleWare/Authorization')
const { ReplSet } = require('mongodb')
require('dotenv').config()


/* ------------------------------- GET REQUESTS ------------------------------- */

ROUTER.get('/all', AuthorizationMiddleWare, (req, res, next) => {
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


/* ------------------------------- POST REQUESTS ------------------------------- */


// Get user details and login
ROUTER.post('/', (req, res, next) => {
    const userCreds = req.body
    if ('email' in userCreds && 'password' in userCreds) {
        utilities.getDocuments('colabnova', 'users', { 'email': userCreds['email'] })
            .then(users => {
                if (users.length < 1) {
                    res.status(constants.statusCodes.unAuthorized).json({
                        'message': 'unauthorized'
                    })
                }
                else {
                    bcrypt.compare(userCreds['password'], users[0]['password'], (error, result) => {
                        if (result) {
                            let userData = users[0]
                            delete userData['password']
                            const jwtToken = jwt.sign(userData, 'secret', { expiresIn: '1h' })
                            res.status(constants.statusCodes.OK).json({
                                'message': 'success',
                                'data': {
                                    'application': 'colabnova',
                                    'date': new Date().toISOString(),
                                    'token': {
                                        'label': 'jwt',
                                        'value': jwtToken
                                    }
                                }
                            })
                        }
                        else {
                            res.status(constants.statusCodes.unAuthorized).json({
                                'message': 'unauthorized'
                            })
                        }
                    })
                }
            })
            .catch(error => {
                res.status(constants.statusCodes.serverError).json({
                    'error': error
                })
            })
    }
    else {
        res.status(constants.statusCodes.unAuthorized).json({
            'message': 'unathorized'
        })
    }
})


// Create a user
ROUTER.post('/new', (req, res, next) => {
    const userData = req.body
    utilities.getDocuments('colabnova', 'users', { 'email': userData['email'] })
        .then(documents => {
            if (documents.length >= 1) {
                res.status(constants.statusCodes.resourceConflict).json({
                    'message': 'user exists'
                })
            }
            else {
                bcrypt.hash(userData['password'], 10, (error, hashedPassword) => {
                    if (error) {
                        res.status(constants.statusCodes.serverError).json({
                            'error': error
                        })
                    }
                    else {
                        userData['userId'] = 'COLAB-' + (Math.ceil(Math.random() * 10000000000000)).toString()
                        userData['password'] = hashedPassword
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
                    }
                })
            }
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