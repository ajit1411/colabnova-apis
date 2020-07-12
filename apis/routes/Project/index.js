const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const mongo = require('mongodb').MongoClient
const constants = require('./../../../Constants')
const utilities = require('./../Utilities')
require('./../Utilities')
require('dotenv').config()
const Authorization = require('./../../../App/MiddleWare/Authorization')
const DB_HOST = 'mongodb://localhost:27017'

/* ------------------------------- GET REQUESTS ------------------------------- */


// Get all projects
ROUTER.get('/my-projects', Authorization, (req, res, next) => {
    utilities.getDocuments('colabnova', 'projects', {}, {})
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
    var project = {
        'projectId': `PROJECT_${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
        'name': req.body.projectName,
        'owner': req.body.projectOwner,
        'description': req.body.description ? req.body.description : 'No description available',
        'createdOn': req.body.createdOn
    }
    utilities.insertData('colabnova', 'projects', project)
        .then(result => {
            res.status(constants.statusCodes.OK).json({
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


module.exports = ROUTER