// User routes
const log = console.log

// express
const express = require('express');
const router = express.Router(); // Express Router

// import the user mongoose model
const { User } = require('../models/user')

// // helpers/middlewares
// const { mongoChecker, isMongoError } = require("./helpers/mongo_helpers");

/*** Helper functions below **********************************/
function isMongoError(error) { // checks for first error returned by promise rejection if Mongo database suddently disconnects
	return typeof error === 'object' && error !== null && error.name === "MongoNetworkError"
}

/*** User API routes ****************/
// Set up a POST route to create a user of your web app (*not* a student).
router.post('/users', async (req, res) => {

	// Create a new user
	const user = new User({
		username: req.body.username,
        password: req.body.password,
        actualName: req.body.actualName,
        gender: req.body.gender,
        birthday: req.body.birthday
	})
	
	try {
		// Save the user
		const newUser = await user.save()
		res.send(newUser)
	} catch (error) {
		if (isMongoError(error)) { // check for if mongo server suddenly disconnected before this request.
			res.status(500).send('Internal server error'+ error)
		} else {
			log(error)
			res.status(400).send('Bad Request' + error) // bad request for changing the student.
		}
	}
})

//////////////

/*** Login and Logout routes ***/
//A route to login and create a session
router.post('/users/login', async (req, res) => {
	const username = req.body.username
	const password = req.body.password

    try {
    	// Use the static method on the User model to find a user
	    // by their username and password.
		const user = await User.findByUsernamePassword(username, password);
		if (!user) {
			// res.redirect('/');
			res.status(500).send('No such user'+ error)
			
        } else {
            // Add the user's id and username to the session.
            // We can check later if the session exists to ensure we are logged in.
            req.session.user = user._id;
            req.session.username = user.username
			//res.redirect('/home');
			res.send(user)
			
        }
    } catch (error) {
    	// redirect to login if can't login for any reason
		if (isMongoError(error)) { 
			res.status(500).redirect('/');
		} else {
			res.status(400).redirect('/');
		}
    }

})

// A route to logout a user
router.get('/users/logout', (req, res) => {
	// Remove the session
	req.session.destroy((error) => {
		if (error) {
			res.status(500).send(error)
		} else {
			res.redirect('/')
		}
	})
})




// export the router
module.exports = router