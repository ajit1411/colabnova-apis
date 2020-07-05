const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const mongo = require('mongodb').MongoClient
const assert = require('assert')
const mongoose = require('mongoose')
const constants = require('./../../../Constants')
const Project = require('./../../Models/Project')
const Task = require('./../../Models/Task')
const utilities = require('./../Utilities')
require('./../Utilities')
require('dotenv').config()
const DB_HOST = 'mongodb://localhost:27017'

/* ------------------------------- GET REQUESTS ------------------------------- */


// Get all the tasks
ROUTER.get('/my-tasks', (req, res, next) => {
    if (req.query && req.query.projectId) {
        const identifiers = {
            'projectId': req.query.projectId
        }
        utilities.getDocuments('colabnova', 'tasks', identifiers)
            .then(result => {
                res.status(constants.statusCodes.OK).json({
                    'data': result
                })
            })
            .catch(error => {
                let err = new Error(error['message'])
                err['status'] = constants.statusCodes.badRequest
                next(err)
            })
    }
    else {
        res.status(constants.statusCodes.badRequest).json({
            'message': 'No projectId given'
        })
    }
})

// Get all projects
ROUTER.get('/my-projects', (req, res, next) => {
    utilities.getDocuments('colabnova', 'projects')
        .then(result => {
            res.status(constants.statusCodes.OK).json({
                'data': result
            })
        })
        .catch(error => {
            let err = new Error(error['message'])
            err['status'] = constants.statusCodes.badRequest
            next(err)
        })
})

// Task details
ROUTER.get('/task', (req, res, next) => {
    const identifiers = {
        'taskId': req.query.taskId
    }
    utilities.getDocuments('colabnova', 'tasks', identifiers)
        .then(result => {
            res.status(200).json({
                'data': result
            })
        })
        .catch(error => {
            res.status(501).json({
                'data': error
            })
        })
})

// Get project details
ROUTER.get('/:projectId', (req, res, next) => {
    if (req.params && req.params.projectId) {
        const identifiers = {
            'projectId': req.params.projectId
        }
        utilities.getDocuments('colabnova', 'projects', identifiers)
            .then(result => {
                res.status(constants.statusCodes.created).json({
                    'data': result[0]
                })
            })
            .catch(error => {
                res.status(constants.statusCodes.serverError).json({
                    'data': error
                })
            })
    }
})


/* ------------------------------- POST REQUESTS ------------------------------- */


// Create a project
ROUTER.post('/', (req, res, next) => {
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
                'data': error
            })
        })
})


// Add task to a project
ROUTER.post('/task', (req, res, next) => {
    if (req.body || req.body.projectId) {
        const projectId = req.body.projectId
        const taskData = {
            'name': req.body.taskName,
            'createdOn': req.body.createdOn,
            'createdBy': req.body.createdBy,
            'isDue': req.body.isDue,
            'assignedTo': req.body.assignedTo ? req.body.assignedTo : 'NA',
            'description': req.body.description ? req.body.description : 'Not available',
            'projectId': projectId
        }
        const identifiers = {
            'projectId': projectId
        }
        utilities.getDocuments('colabnova', 'projects', identifiers)
            .then(result => {
                taskData['taskId'] = `TASK_${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
                utilities.insertData('colabnova', 'tasks', taskData)
                    .then(insertionResult => {
                        res.status(201).json({
                            'data': insertionResult
                        })
                    })
                    .catch(err => {
                        res.status(constants.statusCodes.serverError).json({
                            'data': err
                        })
                    })
            })
            .catch(error => {
                res.status(404).json({
                    'message': 'failed',
                    'data': error
                })
            })
    }
    else {
        let error = new Error('No data or projectId found in body')
        error['status'] = constants.statusCodes.noData
        next(error)
    }
})


/* ------------------------------- DELETE REQUESTS ------------------------------- */
ROUTER.delete('/', (req, res, next) => {
    const projectId = req.body.projectId
    if (projectId) {
        mongo.connect(DB_HOST, (error, dbClient) => {
            if (error) {
                let err = new Error(error)
                err['status'] = constants.statusCodes.serverError
                next(err)
            }
            else {
                const database = dbClient.db('colabnova')
                database.collection('projects').deleteMany({ 'projectId': projectId }, (error, result) => {
                    if (error || (result.deletedCount == 0)) {
                        let err = new Error(error ? error : 'error while deleting')
                        err['status'] = constants.statusCodes.serverError
                        next(err)
                        dbClient.close()
                    }
                    else {
                        dbClient.close()
                        res.status(constants.statusCodes.OK).json({
                            'message': 'deleted',
                            'data': result
                        })
                    }
                })
            }
        })
    }
    else {
        let error = new Error('No project ID given')
        error['status'] = constants.statusCodes.noData
        next(error)
    }
})


module.exports = ROUTER