const express = require('express')
const Task = require('../../models/task')
const User = require('../../models/user')
const auth = require('../../middleware/auth')
const router = new express.Router

router.post('/tasks', auth, async (req, res) => {
    

    // the ES6 spread operator lets us add another property to the Task object, in this case its the ID of the author
    // which we get from the auth middleware be we could merge 2 objects together and even add properties to that merger
    const task = new Task({
        ...req.body,
        author: req.user._id 
    })

    try {
        const newTask = await task.save()
        res.status(201).send(newTask)

    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?complete=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc

router.get('/tasks', auth, async (req, res) => {
    const user = req.user
    const match = {}
    const sort = {}

    if(req.query.sortBy) {
        const splitSort = req.query.sortBy.split(':')
        // here I'm taking the first part of the split and assigning the name of the property and then setting the value with the ternary operator
        // this will set the property and value of the object sort which is using createdAt:asc/desc  
        sort[splitSort[0]] = splitSort[1] === 'desc' ? -1 : 1
        console.log(sort)
    }

    if(req.query.complete) { // si el request lleva query 
        match.complete = req.query.complete === 'true' // valide que el request traiga el string 'true' y setee match.query.complete true, else set it false
    }

    try {
        const tasks = await User.findById(user._id)
        await tasks.populate({ 
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(tasks.tasks)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, author: req.user._id})
        if (!task) {
           return res.status(404).send('Task not found.')
        }

        const data = {...task, userName: req.user.name}
        const toSend = {task: data._doc, user: data.userName}

        res.status(200).send(toSend)

    } catch (e) {
        res.status(404).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'complete']
    const isValidUpdate = updates.every((update) => validUpdates.includes(update)) 

    if(!isValidUpdate) {
        res.status(400).send({error: 'invalid updates!'})
    }

    const _id = req.params.id
    const update = req.body

    try {
        //model.find returns an array and will have to identify the index of the array to take the object, and model.findOne returns the object directly to work with it
        const task = await Task.findOne({_id, author: req.user._id}) 

        if (!task) {
           return res.status(404)
        }

        updates.forEach((element) => {
            task[element] = update[element]
            console.log(task[element])
            console.log(update[element])
        })
        
        console.log(task)
        await task.save()

        res.status(200).send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const user = req.user

    try {
        const deleteTask = await Task.findOneAndDelete({_id, author: user._id})
        if(!deleteTask) {
            return res.status(404).send({error: 'Task Not Found'})
         } 

        res.status(200).send(deleteTask)
    } catch (e) {
        res.status(404).send(e)
    }

})

module.exports = router