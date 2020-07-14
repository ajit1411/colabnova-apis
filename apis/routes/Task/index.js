const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const constants = require('./../../../Constants')
const utilities = require('./../Utilities')
const Authorization = require('./../../../App/MiddleWare/Authorization')
const jwt = require('jsonwebtoken')
require('dotenv').config()


/* ------------------------------- GET REQUESTS ------------------------------- */


// Get all the tasks
ROUTER.get('/my-tasks', Authorization, (req, res, next) => {
    const userData = jwt.decode(req.headers.authorization.split(' ').pop())
    utilities.getDocuments('colabnova', 'users', { 'userId': userData['userId'] })
        .then(users => {
            if (users.length >= 1) {
                utilities.getDocuments('colabnova', 'tasks', { 'assignedTo.email': userData['email'] })
                    .then(tasks => {
                        res.status(constants.statusCodes.OK).json({
                            'myTasks': tasks
                        })
                    })
                    .catch(error => {
                        res.status(constants.statusCodes.serverError).json({
                            'error': error
                        })
                    })
            }
            else {
                res.status(constants.statusCodes.unAuthorized).json({
                    'error': 'Unauthorized'
                })
            }
        })
        .catch(error => {
            res.status(constants.statusCodes.serverError).json({
                'error': error
            })
        })
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
    var userData = jwt.decode(req.headers.authorization.split(' ').pop())
    delete userData['iat']
    delete userData['exp']
    utilities.getDocuments('colabnova', 'users', { 'email': userData['email'] })
        .then(users => {
            if (users.length >= 1) {
                utilities.getDocuments('colabnova', 'projects', { 'users.email': users[0]['email'] })
                    .then(projects => {
                        if (projects.length > 0) {
                            const myProject = projects.filter(project => {
                                if (project['projectId'] === req.body.projectId) {
                                    return project
                                }
                            })
                            if (myProject && myProject.length > 0) {
                                const taskData = {
                                    'name': req.body.taskName,
                                    'createdOn': req.body.createdOn,
                                    'createdBy': userData,
                                    'isDue': req.body.isDue,
                                    'assignedTo': req.body.assignedTo ? req.body.assignedTo : userData,
                                    'description': req.body.description ? req.body.description : 'Not available',
                                    'projectId': myProject[0]['projectId'],
                                    'status': 'new',
                                    'taskId': `TASK_${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
                                }
                                utilities.insertData('colabnova', 'tasks', taskData)
                                    .then(insertionResult => {
                                        res.status(constants.statusCodes.created).json({
                                            'message': 'created',
                                            'data': taskData
                                        })
                                    })
                                    .catch(error => {
                                        res.status(constants.statusCodes.serverError).json({
                                            'error': error
                                        })
                                    })
                            }
                            else {
                                res.status(constants.statusCodes.unAuthorized).json({
                                    'error': 'project not found'
                                })
                            }
                        }
                        else {
                            res.status(constants.statusCodes.unAuthorized).json({
                                'error': 'Unauthorized'
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
                    'error': 'Unauthorized'
                })
            }
        })
        .catch(error => {
            res.status(constants.statusCodes.badRequest).json({
                'error': error
            })
        })
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


ROUTER.delete('/', (req, res, next) => {
    const identifiers = {
        'taskId': req.body.taskId
    }
    utilities.deleteDocument('colabnova', 'tasks', identifiers)
        .then(result => {
            res.status(constants.statusCodes.OK).json(result)
        })
        .catch(error => {
            res.status(constants.statusCodes.badRequest).json(error)
        })
})



module.exports = ROUTER