const app = require('./app') 
const port = process.env.PORT

app.listen(port, () => {
    console.log(`Local server is up and running on port ${port}!`)
})

// app.use((req, res, next) => { // if you don't call next() the routers wont be executed
//     res.status(503).send('Site is under Maintenance, please try again later')
// })

// app.use((req, res, next) => {
//     if(req.method === 'GET') {
//         res.send('GET requests are disabled')
//     }

//     next() // when calling next it continues with the rest of the code, otherwise it won't execute
// })

// express middleware is anything that has to run bewtween the request and the router, could be a function 
// express middleware needs to run before any of the instances below (app.use)

// const multer = require('multer')

// const upload = multer({
//     dest: 'avatars',
//     limits: {
//         fileSize: 1000000 // 1 million bytes is 1Mb
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('Please upload a doc or docx file'))
//         }
//         cb(undefined, true)

//         // cb(new Error('Wrong file type')) 
//         // cb(undefined, true)
//         // cb(undefined, false)
//     }
// })

// const middlewareErrror = (req, res, next) => {
//     throw new Error('from my middleware')
// }

// app.post('/upload', middlewareErrror, (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })

// const User = require('../src/models/user')
// const Task = require('../src/models/task')



// const main = async () => {
    // const task = await Task.findById('5f550fd4db395a2ad821a32b')
    // await task.populate('author').execPopulate()
    // console.log(task.author)

//     const user = await User.findById('5f55983fbdc3a4935c6a0e6d')
//     await user.populate('tasks').execPopulate()
//     user.tasks.forEach((element) => {
//         console.log(element.name)
//     })   
// }

// main()
// const jwt = require('jsonwebtoken')

// const myFunction = async () => {

//     const token = jwt.sign({ _id: '123456' }, 'thisismynewcourse', {expiresIn: '7 days'})
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// myFunction()