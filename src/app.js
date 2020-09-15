const express = require('express')
require('./db/mongoose')
const userRouter = require('./db/routers/user')
const taskRouter = require('./db/routers/task')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app