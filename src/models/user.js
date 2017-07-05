const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value)
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Override of what mongoose sends back when an object is converted to JSON
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject(); // Takes a mongoose variable and convert it to a regular object with the properties available in the document
    return _.pick(userObject, ['_id', 'email']);
};

// .statics turns the method into a model method as opposed toan instance method.
UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decoded;

    try{
        decoded = jwt.verify(token, '123abc');
    } catch(e) {
        return Promise.reject(e);
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
}

UserSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id.toHexString(), access }, '123abc').toString();

    user.tokens.push({access, token});

    return user.save().then(() => token); // This value will be passed on to the next 'then' call. This is the value which will be added to a header.
};

const User = mongoose.model('User', UserSchema);

module.exports = { User }