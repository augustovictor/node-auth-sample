const { ObjectID } = require('mongodb');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const usersSeed = [
    {
        _id: userOneId,
        name: 'User 1',
        email: 'user1@email.com',
        password: '123456',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: userOneId, access: 'auth'}, '123abc').toString()
        }]
    }, {
        _id: userTwoId,
        name: 'User 2',
        email: 'user2@email.com',
        password: '123456'
    }
];

const populateUsers = done => {
    User.remove({})
    .then(() => {
        const userOne = new User(usersSeed[0]).save();
        const userTwo = new User(usersSeed[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {
    usersSeed, populateUsers
}