const mongoose = require('mongoose')
const User = require('./user')

const taskSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    complete: {
        type: Boolean,
        default: false
    },

    author: {
        type: mongoose.Schema.Types.ObjectId, // this is the user ID
        required: true, // it is required that the task has an author asociated with it
        ref: 'User' // this is there reference to the model User, we take the id up above to asociate this task with the user
    }   
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task