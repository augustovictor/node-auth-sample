const { User } = require('../models/user');

authenticate = (req, res, next) => {
    const token = req.header('x-auth');
    console.log(token);
    User.findByToken(token)
    .then(user => {
        if(!user) return Promise.reject();
        req.user  = user;
        req.token = token;
        next();
    }).catch(e => res.status(401).send(e));
};

module.exports = {
    authenticate
};