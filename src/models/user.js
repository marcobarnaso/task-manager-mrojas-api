const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Please input a valid email')
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    }, 
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('Please dont use "password" as a password')
            }
        }
    }, 
    tokens: [{
            token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true // created at and updated at timestamps
})

// this is a virtual field for the User schema, this will help bring the tasks made from a specific user with user.tasks in the router 
userSchema.virtual('tasks', {
    ref: Task, // the reference is the Task model
    localField: '_id', // this is the type: mongoose.Schema.Types.ObjectId from the author field in Task model, which references the user ID 
    foreignField: 'author' // this is the author field in the Task model 

})

// when using this schema.methods.toJSON you can manipulate the properties of the object you're sending back
// in this case we're deleting the sensitive information like the password and the tokens array
// this gets called automatically when sending the response 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// .methods is used for instanced methods and uses this. in here we need to track a specific user
// since we need to manipulate a specific user with this. it needs to use a normal function instead of an arrow one
userSchema.methods.generateAuthToken = async function () { 
    const user = this
    const _id = user._id.toString()

    const token = jwt.sign({ _id }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// .statics are used for model methods and it can use an arrow function as you can see we're using the model User
userSchema.statics.findByCredentials = async (email, password) => { 
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }
    const validatePassword = await bcrypt.compare(password, user.password)
    
    if (!validatePassword) {
        throw new Error('Unable to login')
    }

    return user
}

// hash the plain text password before saving with a pre hook, if the password is changed when updating a user, it will be hashed
// same when the user is being created, the password provided will be hashed and stored in the DB
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})    

// delete the tasks when the user is deleted, here we made a pre-hook to delete the tasks from a specific user before deleting the
// user with the remove command in the router
userSchema.pre('remove', async function (next) {
    const user = this 

    await Task.deleteMany({author: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User