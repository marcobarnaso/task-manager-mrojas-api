const jwt = require('jsonwebtoken') //required to create the token to test autenticated actions like deleting and updating
const mongoose = require('mongoose') // required to create the objectId
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'Mario',
    age: 35,
    email: 'marvin@gagaga.com',
    password: 'nerdtastik1',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
    _id: userTwoId,
    name: 'Peach',
    age: 22,
    email: 'peach@gagaga.com',
    password: 'nerdtastik2',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    name: 'complete global saturation',
    complete: false,
    author: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    name: 'world domination',
    complete: true,
    author: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    name: 'world domination again',
    complete: true,
    author: userTwoId
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    setupDatabase,
    userOne,
    userTwo,
    taskOne
}