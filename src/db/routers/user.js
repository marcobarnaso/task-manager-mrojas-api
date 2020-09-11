const express = require('express')
const User = require('../../models/user')
const auth = require('../../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../../emails/account')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token })

    } catch (e) {
        res.status(401).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            console.log(token._id)
            //console.log(token.token)
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        res.send()
        await req.user.save()
    } catch (e) {
        res.status(500).send(e)
    }
})

// here we add a parameter to call the middleware function we created which is auth and it was imported above
// the function searches for the user currently logged in with the id and token
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// router.get('/users/:id', (req, res) => {
//     const _id = req.params.id

//     try {
//         User.findById(_id).then((user) => {
//             if (!user) {
//                 return res.status(404).send('User Not Found.')
//             }
//             res.status(200).send(user)
//         })
//     } catch (e) {
//         res.status(404).send('User Not Found')
//     }
// })

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'password', 'email', 'age']
    const isValidUpdate = updates.every((update) => validUpdates.includes(update))

    if (!isValidUpdate) {
        res.status(400).send({ error: 'invalid updates!' })
    }

    const user = req.user
    const update = req.body

    try {
        updates.forEach((element) => {
            user[element] = update[element]
        })
        await user.save()
        res.send(user)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    // we don't need to pass the id as a parameter, since the middleware (auth) contains the id, we take it from there
    // without the middleware we would need to provide the id in the request from postman 
    const user = req.user

    try {
        sendCancelEmail(user.email, user.name)
        await req.user.remove()
        res.send(user)

    } catch (e) {
        res.status(404).send(e)
    }
})

const upload = multer({
    //dest: 'avatars', //this is the destination folder, if we need to pass the file data to the function to work with it, we don't need it
    limits: {
        fileSize: 1000000 // 1 million bytes is 1Mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png)$/)) { // the regular expression inside the if statement will match the documents with the extentions I want
            return cb(new Error('Please upload a jpeg or pgn file'))
        }
        cb(undefined, true)

        // cb(new Error('Wrong file type')) 
        // cb(undefined, true)
        // cb(undefined, false)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // the sharp package lets us normalize the images that are uploaded, here we resize them and convert them to png before converting them to buffer again 
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer // we're storing the image in the avatar property of the user model
    await req.user.save() // then we save the user
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    const user = req.user

    try {
        if (user.avatar === undefined) {
            console.log('here')
            throw new Error('There is no avatar to delete in this account')
        }
        user.avatar = undefined
        await user.save()
        res.send()
    } catch (e) {
        res.status(404).send({ error: e.message })
    }

})

router.get('/users/me/avatar', auth, async (req, res) => {
    const user = req.user

    try {
        if (user.avatar === undefined) {
            throw new Error('There is no avatar for this account')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send({ error: e.message })
    }
})

module.exports = router