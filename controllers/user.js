const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require('../auth')

module.exports.register = (req, res) => {
    if (!req.body.email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    } else {
        let newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'Registered Successfully',
            user: result
        }))
        .catch(error => {
            return res.status(500).send({ error: 'An error occurred during registration' });
        });
    }
};

module.exports.login = (req, res) => {
    if (req.body.email.includes("@")) {
        return User.findOne({ email: req.body.email })
            .then(result => {
                if (result == null) {
                    return res.status(404).send({ message: 'No email found' });
                } else {
                    const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                    if (isPasswordCorrect) {
                        return res.status(200).send({ 
                            message: 'Logged in successfully',
                            access: auth.createAccessToken(result)
                        });
                    } else {
                        return res.status(401).send({ message: 'Incorrect email or password' });
                    }
                }
            })
            .catch(error => {
                return res.status(500).send({ error: 'An error occurred during login' });
            });
    } else {
        return res.status(400).send({ message: 'Invalid email format' });
    }
};

module.exports.profileDetails = (req, res) => {

    return User.findById(req.user.id)
    .then(user => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.password = undefined;

        return res.status(200).send({ user });
    })
    .catch(err => {
        console.error("Error in fetching user profile", err)
        return res.status(500).send({ error: 'Failed to fetch user profile' })
    });

};

module.exports.retrieveAllUsers = (req, res) =>{
    User.find()
    .then( user => {
        if(user.length >= 0){
            return res.status(200).send(user)
        }
        else
        {
            return res.status(404).send({ error: 'No users found' })
        }
    }).catch(error => errorHandler(error, req, res))
}

