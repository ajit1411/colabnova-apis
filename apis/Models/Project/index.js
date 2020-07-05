const mongoose = require('mongoose')


// Create Organization schema
const ProjectSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    owner: String,
    tasks: Array
})

module.exports = mongoose.model('Project', ProjectSchema)