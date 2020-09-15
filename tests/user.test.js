const request = require('supertest') // supertest is required to make the the requests to our endpoints
const app = require('../src/app')  // this is requiring express server, which is in the app file
const User = require('../src/models/user') //we load this is so we can create and validate users for the tests
const {userOne, setupDatabase} = require('../tests/fixtures/db')

beforeEach(setupDatabase)

test('should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Marvin',
            age: 22,
            email: 'marvin@here.com',
            password: 'nerdtastik3'
        })
        .expect(201)

    // assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Marvin',
            email: 'marvin@here.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('nerdtastik3')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
    const user = await User.findById(response.body.user._id)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login unexistent user', async () => {
    await request(app).post('/users/login')
        .send({
            email: 'notAUser',
            password: 'notCorrect'
        })
        .expect(401)
})

test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get user profile', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(response.body._id)
    expect(user).toBeNull()
})

test('Should delete account', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/fine.png')
    .expect(200)

    const user = await User.findById(userOne._id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update user infrmation', async () => {
     await request(app)
     .patch('/users/me')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .send({
         name: 'Luigi'
     })
     .expect(200)

     const user = await User.findById(userOne._id)
     expect(user.name).toBe('Luigi')
})

test('Should not update user information', async () => {
    await request(app)
    .patch('/users/me')
    .send({
        name: 'Luigi'
    })
    .expect(401)

    const user = await User.findById(userOne._id)
    expect(user.name).toBe('Mario')
})
