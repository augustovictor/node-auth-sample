const { User } = require('../models/user');

const { app } = require('../../app');
const request = require('supertest');
const expect = require('expect');

const UsersSeed = [
    {name: 'User 1', email: 'user1@email.com', password: '123456'},
    {name: 'User 2', email: 'user2@email.com', password: '123456'},
    {name: 'User 3', email: 'user3@email.com', password: '123456'}
];

beforeEach(done => {
    User.remove({})
    .then(() => User.insertMany(UsersSeed))
    .then(() => done())
    .catch(e => done(e));
});

describe('GET /users', () => {
    it('should return an array of users', done => {
        request(app)
        .get('/users')
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).toBeA('array');
            expect(res.body.length).toBe(3);
            done();
        });
    });
});

describe('POST /users', () => {
    it('should insert a valid user', done => {
        user = { name: 'User post', email: 'userpost@email.com', password: '123456' };
        request(app)
        .post('/users')
        .send(user)
        .expect(200)
        .end((err, res) => {
            if(err) return done(err);

            User.findOne(user)
            .then(user => {
                expect(user).toBe(user);
                done();
            })
            .catch(e => done(e));
        });
    });
});