/////////////////////////////////
// Import dependencies
/////////////////////////////////
const express = require('express')
const User = require('../models/user')
// bcrypt is used to hash(re: encrypt) passwords
const bcrypt = require('bcryptjs')


/////////////////////////////////
// Create a router
/////////////////////////////////
const router = express.Router()

/////////////////////////////////
// list out our routes
/////////////////////////////////
// two sign up routes
// one GET to show the form
router.get('/signup', (req, res) => {
    res.render('users/signup')
})

// one POST to make the db request
router.post('/signup', async (req, res) => {
    console.log('this is our initial request body', req.body)
    // first, we need to encrypt our password
    // that's why we made this an async function
    // because the password hashing takes a little time, we want to wait until it's done before things progress
    // we need to wait for bcrypt to run its 'salt rounds' before continuing
    // salt rounds are like saying "encrypt this x amount of times before settling on one encryption"
    req.body.password = await bcrypt.hash(
        req.body.password,
        await bcrypt.genSalt(10)
    )

    // now that our password is hashed, we can create a user
    console.log('this is request body after hashing', req.body)
    User.create(req.body)
        // if created successfully, we'll redirect to the login page
        .then(user => {
            console.log('this is the new user', user)
            res.redirect('/users/login')
        })
        // if creation was unsuccessful, send the error
        .catch(error => {
            console.log(error)
            res.json(error)
        })
})

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    console.log('this is session', req.session)

    User.findOne({ username })
        .then(async (user) => {
            if (user) {
                const result = await bcrypt.compare(password, user.password)

                if (result) {
                    req.session.username = username
                    req.session.loggedIn = true
                    req.session.userId = user._id
                    console.log('this is the session after login', req.session)
                    res.redirect('/anime')
                } else {
                    res.json({ error: 'username or password incorrect' })
                }
            } else {
                res.json({ error: 'user does not exist' })
            }

        })
        .catch(error => {
            console.log(error)
            res.json(error)
        })
})


router.get('/logout', (req, res) => {
    req.session.destroy(ret => {
        console.log('this is the error in logout', ret)
        console.log('session has been destroyed')
        console.log(req.session)
        res.redirect('/anime')
    })
})

/////////////////////////////////
// export our router
/////////////////////////////////
module.exports = router