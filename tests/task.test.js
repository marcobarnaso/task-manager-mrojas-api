const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOne, userTwo, taskOne, setupDatabase} = require('../tests/fixtures/db')

beforeEach(setupDatabase)

test('Should create test for user', async () => {
   const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'complete global saturation',
        complete: false
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(userOne._id).toEqual(task.author)
})

test('Should get all tasks for a user', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
})

test('Try to delete another user task', async () => {
    await request(app)
    .post(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})