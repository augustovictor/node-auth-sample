const { User } = require('../models/user');
const { app } = require('../../app');
const request = require('supertest');
const expect = require('expect');
const { usersSeed, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);

describe('GET /users', () => {
    it('should return an array of users', done => {
        request(app)
        .get('/users')
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).toBeA('array');
            expect(res.body.length).toBe(2);
            done();
        });
    });
});

describe('POST /users', () => {
    it('should insert a valid user', done => {
        const mockUser = { name: 'MockUser', email: 'mockuser@email.com', password: '123456' };
        request(app)
        .post('/users')
        .send(mockUser)
        .expect(200)
        .expect(res => {
            expect(res.header['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toEqual(mockUser.email);
        })
        .end(err => {
            if(err) return done(err);

            User.findOne({ email: mockUser.email }).then(user => {
                expect(user).toExist();
                expect(user.password).toNotBe(mockUser.password);
                done();
            }).catch(e => done(e));
        });
    });

    it('should return validation errors if user is invalid', done => {
        const email = 'aaaaa.com';
        const password = '123';
        request(app)
        .post('/users')
        .send({ email, password })
        .expect(400)
        .end(done);
    });

    it('should not create user if email is in use', done => {
        const name = 'Victor';
        const email = usersSeed[0].email;
        const password = '123456';
        request(app)
        .post('/users')
        .send({ name, email, password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', done => {
        const { email, password } = usersSeed[1];
        request(app)
        .post('/users/login')
        .send({ email, password })
        .expect(200)
        .expect(res => {
            expect(res.headers['x-auth']).toExist();
        }).end((err, res) => {
            if(err) return done(err);
            User.findById(usersSeed[1]._id).then(user => {
                expect(user.tokens[0]).toInclude({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
            done();
            }).catch(e => done(e));
        });
    });

    it('should reject invalid login', done => {
        const { email } = usersSeed[1];
        request(app)
        .post('/users/login')
        .send({ email, password: 'wrongPass' })
        .expect(401)
        .expect(res => {
            expect(res.headers['x-auth']).toNotExist();
        }).end((err, res) => {
            if(err) return done(err);
            User.findById(usersSeed[1]._id).then(user => {
                expect(user.tokens.length).toBe(0);
                done();
            })
            .catch(e => done(e));
        });
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
        request(app)
        .get('/users/me')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .expect(res => {
            expect(res.body._id).toBe(usersSeed[0]._id.toHexString());
            expect(res.body.email).toBe(usersSeed[0].email);
        }).end(done);
    });

    it('should return 401 if user is not authenticated', done => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect(res => {
            expect(res.body.name).toBe('JsonWebTokenError');
        })
        .end(done);
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove user auth token on logout', done => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if(err) return done(err);
            User.findById(usersSeed[0]._id).then(user => {
                console.log('asdfasdfasfasf');
                expect(user.tokens.length).toBe(0);
                done();
            }).catch(e => done(e));
        });
    });
});