const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()
const mongo = require('mongodb').MongoClient
const assert = require('assert')
const mongoose = require('mongoose')
const constants = require('./../../../Constants')
const Project = require('./../../Models/Project')
const Task = require('./../../Models/Task')
const utilities = require('./../Utilities')
require('dotenv').config()
const DB_HOST = 'mongodb://localhost:27017'

/* ------------------------------- GET REQUESTS ------------------------------- */


// Get all the projects
ROUTER.get('/', (req, res, error) => {
    var myProjects = []
    mongo.connect(DB_HOST, (error, dbClient) => {
        if (error) {
            let err = new Error(error)
            err['status'] = constants.statusCodes.badRequest
            next(err)
        }
        else {
            const database = dbClient.db('colabnova')
            var dbCursor = database.collection('projects').find()
            dbCursor.forEach((project, error) => {
                if (error) {
                    next(error)
                }
                else {
                    myProjects.push(project)
                }
            }, () => {
                dbClient.close()
                res.status(constants.statusCodes.OK).json({
                    'message': 'success',
                    'data': myProjects
                })
            });
        }
    })
})

// Get all the tasks
ROUTER.get('/my-tasks', (req, res, next) => {
    var myTasks = []
    mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : DB_HOST, (error, dbClient) => {
        if (error) {
            let err = new Error(error ? error : 'Error while connecting to host')
            err['status'] = constants.statusCodes.serverError
            next(err)
        }
        else {
            const database = dbClient.db(process.env.APP_DATABASE ? process.env.APP_DATABASE : 'colabnova')
            let dbCursor = database.collection('tasks').find()
            dbCursor.forEach(task => {
                myTasks.push(task)
            }, () => {
                dbClient.close()
                res.status(constants.statusCodes.OK).json({
                    'message': 'success',
                    'data': myTasks
                })
            })
        }
    })
})


// Fetch all the project data
ROUTER.get('/:projectId', (req, res, next) => {
    const projectId = req.params.projectId
    if (projectId) {
        Project
            .findOne({ '_id': projectId })
            .exec()
            .then(document => {
                console.log('found')
                res.status(constants.statusCodes.OK).json({
                    'message': 'found',
                    'data': document
                })
            })
            .catch(err => {
                console.log(err)
                let error = new Error(err)
                error['status'] = constants.statusCodes.serverError
                next(error)
            })
    }
    else {
        let error = new Error('No project id found')
        error['status'] = constants.statusCodes.noData
        next(error)
    }
})

// Fetch task details
ROUTER.get('/task/:taskId', (req, res, next) => {
    const taskId = req.params.taskId
    if (taskId) {
        let myTasks = []
        mongoClient.connect(process.envAPP_DB_HOST, (error, database) => {
            assert.equal(null, error)
            if (error) {
                let err = new Error(error)
                err['status'] = constants.statusCodes.serverError
                next(err)
            }
            else {
                var cursor = database.collection('Task').find()
                cursor.forEach((document, err) => {
                    assert(null, err)
                    myTasks.push(document)
                });
                res.status(constants.statusCodes.OK).json({
                    'message': 'success',
                    'data': myTasks
                })
            }
            database.close
        })
    }
    else {
        let error = new Error('No task id found')
        error['status'] = constants.statusCodes.noData
        next(error)
    }
})


/* ------------------------------- POST REQUESTS ------------------------------- */


// Create a project
ROUTER.post('/', (req, res, next) => {
    var project = {
        'projectId': `${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
        'name': req.body.projectName,
        'owner': req.body.projectOwner,
        'description': req.body.description ? req.body.description : 'No description available',
        'tasks': []
    }
    mongo.connect('mongodb://localhost:27017', function (err, dbClient) {
        assert.equal(null, err)
        if (err) {
            let error = new Error(err)
            error['status'] = constants.statusCodes.serverError
            next(error)
        }
        else {
            const database = dbClient.db('colabnova')
            database.collection('projects').insertOne(project, (error, result) => {
                if (error) {
                    dbClient.close()
                    let err = new Error(error)
                    err['status'] = constants.statusCodes.serverError
                    next(err)
                }
                else {
                    dbClient.close()
                    res.status(constants.statusCodes.created).json({
                        'message': 'success'
                    })
                }
            })
        }
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
        // We will check if requesting project exist or not in our database
        let data = {}
        mongo.connect(process.env.DB_HOST ? process.env.DB_HOST : 'mongodb://localhost:27017', (error, dbClient) => {
            if (error) {
                dbClient.close()
                let err = new Error(error)
                err['status'] = constants.statusCodes.serverError
                next(err)
            }
            else {
                let projectList = []
                const database = dbClient.db('colabnova');
                let dbCursor = database.collection('projects').find({ 'projectId': projectId });
                dbCursor.forEach(project => {
                    projectList.push(project)
                }, () => {
                    if (projectList.length > 0) {
                        let projectData = projectList[0]
                        let myTasks = projectData['tasks']
                        myTasks.push(taskData)
                        database.collection('projects').updateOne({ 'projectId': projectId }, { '$set': { 'tasks': myTasks } }, (error, result) => {
                            if (error) {
                                let err = new Error(error)
                                err['status'] = constants.statusCodes.serverError
                                next(err)
                            }
                            else {
                                res.status(201).json({
                                    'message': 'task added',
                                    'data': result
                                })
                            }
                        })
                    }
                    else {
                        let error = new Error('No project found')
                        error['status'] = constants.statusCodes.unAuthorized
                        next(error)
                    }
                })
            }
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
                database.collection('projects').deleteOne({ 'projectId': projectId }, (error, result) => {
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