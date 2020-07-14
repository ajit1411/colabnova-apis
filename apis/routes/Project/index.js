const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const mongo = require('mongodb').MongoClient
const constants = require('./../../../Constants')
const utilities = require('./../Utilities')
require('./../Utilities')
require('dotenv').config()
const Authorization = require('./../../../App/MiddleWare/Authorization')
const jwt = require('jsonwebtoken')
const DB_HOST = 'mongodb://localhost:27017'

/* ------------------------------- GET REQUESTS ------------------------------- */


// Get all projects
ROUTER.get('/my-projects', Authorization, (req, res, next) => {
    var userData = jwt.decode(req.headers.authorization.split(' ').pop())
    utilities.getDocuments('colabnova', 'users', { 'email': userData['email'] })
        .then(documents => {
            if (documents.length >= 1) {
                utilities.getDocuments('colabnova', 'projects', { 'users.userId': userData['userId'] }, {})
                    .then(result => {
                        res.status(constants.statusCodes.OK).json({
                            'my-projects': result
                        })
                    })
                    .catch(error => {
                        let err = new Error(error['message'])
                        err['status'] = constants.statusCodes.badRequest
                        next(err)
                    })
            }
            else {
                let error = new Error('Unauthorized')
                error['status'] = constants.statusCodes.unAuthorized
                next(error)
            }
        })
        .catch(error => {
            res.status(constants.statusCodes.serverError).json({
                'error': error
            })
        })
})

// Get project details
ROUTER.get('/:projectId', Authorization, (req, res, next) => {
    if (req.params && req.params.projectId) {
        const identifiers = {
            'projectId': req.params.projectId
        }
        utilities.getDocuments('colabnova', 'projects', identifiers)
            .then(projectData => {
                utilities.getDocuments('colabnova', 'tasks', identifiers)
                    .then(tasks => {
                        res.status(constants.statusCodes.OK).json({
                            'projectDetails': projectData[0],
                            'tasks': tasks ? tasks : []
                        })
                    })
                    .catch(error => {
                        res.status(constants.statusCodes.serverError).json({
                            'error': error
                        })
                    })
            })
            .catch(error => {
                res.status(constants.statusCodes.serverError).json({
                    'error': error
                })
            })
    }
})


/* ------------------------------- POST REQUESTS ------------------------------- */

// Create a project
ROUTER.post('/new', Authorization, (req, res, next) => {
    var userData = jwt.decode(req.headers.authorization.split(' ').pop())
    delete userData['iat']
    delete userData['exp']
    utilities.getDocuments('colabnova', 'users', { 'email': userData['email'] })
        .then(documents => {
            if (documents.length >= 1) {
                var project = {
                    'projectId': `PROJECT_${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
                    'name': req.body.projectName,
                    'owner': userData,
                    'description': req.body.description ? req.body.description : 'No description available',
                    'createdOn': req.body.createdOn ? req.body.createdOn : new Date().toISOString(),
                    'type': req.body.accessType,
                    'users': [userData]
                }
                utilities.insertData('colabnova', 'projects', project)
                    .then(result => {
                        res.status(constants.statusCodes.created).json({
                            'message': 'Project created',
                            'projectId': project['projectId']
                        })
                    })
                    .catch(error => {
                        res.status(404).json({
                            'message': 'failed',
                            'error': error
                        })
                    })
            }
            else {
                res.status(404).json({
                    'message': 'Unauthorized',
                })
            }
        })
        .catch(error => {
            res.status(501).json({
                'error': error
            })
        })
})


// Update the project details
ROUTER.post('/', Authorization, (req, res, next) => {
    const updatedProjectDetails = req.body.projectDetails
    if ('_id' in updatedProjectDetails) {
        delete updatedProjectDetails['_id']
    }
    const identifiers = {
        'projectId': req.body.projectDetails.projectId
    }
    utilities.getDocuments('colabnova', 'projects', identifiers)
        .then(result => {
            if (result && result.length > 0) {
                utilities.updateDocument('colabnova', 'projects', identifiers, updatedProjectDetails)
                    .then(updatedResult => {
                        res.status(200).json({
                            'message': updatedResult
                        })
                    })
                    .catch(error => {
                        res.status(constants.statusCodes.serverError).json({
                            'error': error
                        })
                    })
            }
            else {
                let error = new Error('No projectId or taskId found in the database!')
                error['status'] = constants.statusCodes.notFound
                next(error)
            }
        })
        .catch(error => {
            let err = new Error(error)
            err['status'] = constants.statusCodes.serverError
            next(err)
        })
})


ROUTER.delete('/', (req, res, next) => {
    const identifiers = {
        'projectId': req.body.projectId
    }
    utilities.deleteDocument('colabnova', 'projects', identifiers)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(error => {
            res.status(constants.statusCodes.badRequest).json(error)
        })
})


module.exports = ROUTER