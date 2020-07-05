const mongoose = require('mongoose')


// Create Organization schema
const organizationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: Number,
    owner: String
})

module.exports = mongoose.model('Organization', organizationSchema)