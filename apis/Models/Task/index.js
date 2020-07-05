const mongoose = require('mongoose')


// Create Organization schema
const TaskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: Number,
    createdBy: String,
    assignedTo: String,
    createdOn: String,
    dueDate: String,
    isComplete: Boolean
})

module.exports = mongoose.model('Task', TaskSchema)