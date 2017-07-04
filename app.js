const config = require('./src/config/config');
const { mongoose } = require('./src/db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./src/models/user');
const _ = require('lodash');

const app = express();

app.use(bodyParser.json());

app.get('/users', (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    })
    .catch(e => res.status(400).send(e));
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['name', 'email', 'password']);
    const user = new User(body);

    user.save()
    .then(() => user.generateAuthToken())
    .then(token => {
        res.header('x-auth', token).send(user); // Headers preceeded by 'x' are custom headers that are not necesserily supported by default http
    })
    .catch(e => res.status(400).send(e));
});

app.listen(process.env.PORT, () => {
    console.log(`Running at http://localhost:${process.env.PORT}`);
});

module.exports = { app }