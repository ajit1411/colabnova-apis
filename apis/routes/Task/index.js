const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const constants = require('./../../../Constants')
const utilities = require('./../Utilities')
const Authorization = require('./../../../App/MiddleWare/Authorization')
require('dotenv').config()


/* ------------------------------- GET REQUESTS ------------------------------- */


// Get all the tasks
ROUTER.get('/my-tasks', Authorization, (req, res, next) => {
    if (req.query && req.query.projectId) {
        const identifiers = {
            'projectId': req.query.projectId
        }
        utilities.getDocuments('colabnova', 'tasks', identifiers)
            .then(result => {
                res.status(constants.statusCodes.OK).json({
                    'myTasks': result
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

// Task details
ROUTER.get('/', Authorization, (req, res, next) => {
    const identifiers = {
        'taskId': req.query.taskId
    }
    utilities.getDocuments('colabnova', 'tasks', identifiers)
        .then(result => {
            if (result && result.length > 0) {
                res.status(200).json({
                    'taskDetails': result
                })
            }
            else {
                let error = new Error('No task found!')
                error['status'] = constants.statusCodes.notFound
                next(error)
            }
        })
        .catch(error => {
            res.status(501).json({
                'error': error
            })
        })
})

/* ------------------------------- POST REQUESTS ------------------------------- */


// Add task to a project
ROUTER.post('/new', Authorization, (req, res, next) => {
    if (req.body || req.body.projectId) {
        const projectId = req.body.projectId
        const taskData = {
            'name': req.body.taskName,
            'createdOn': req.body.createdOn,
            'createdBy': req.body.createdBy,
            'isDue': req.body.isDue,
            'assignedTo': req.body.assignedTo ? req.body.assignedTo : 'NA',
            'description': req.body.description ? req.body.description : 'Not available',
            'projectId': projectId,
            'status': 'in-progress'
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
                            'message': 'success'
                        })
                    })
                    .catch(err => {
                        res.status(constants.statusCodes.serverError).json({
                            'error': err
                        })
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
        let error = new Error('No data or projectId found in body')
        error['status'] = constants.statusCodes.serverError
        next(error)
    }
})


// Update the task 
ROUTER.post('/', Authorization, (req, res, next) => {
    const updatedTaskDetails = req.body.taskDetails
    if ('_id' in updatedTaskDetails) {
        delete updatedTaskDetails['_id']
    }
    const identifiers = {
        'projectId': req.body.taskDetails.projectId,
        'taskId': req.body.taskDetails.taskId
    }
    utilities.getDocuments('colabnova', 'tasks', identifiers)
        .then(result => {
            if (result && result.length > 0) {
                utilities.updateDocument('colabnova', 'tasks', identifiers, updatedTaskDetails)
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
            let err = new Error(error.data)
            err['status'] = constants.statusCodes.serverError
            next(err)
        })
})



module.exports = ROUTER