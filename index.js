const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const DriveTest = require('./models/DriveTest');
const session = require('express-session');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));


mongoose.connect('mongodb+srv://admin:admin@tigerdata1.ddmfj.mongodb.net/DriverTest_DB?retryWrites=true&w=majority&appName=Tigerdata1')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


const requireDriver = (req, res, next) => {
    if (!req.session.userId || req.session.userType !== 'Driver') {
        return res.redirect('/login');
    }
    next();
};


app.get('/', (req, res) => {
    res.redirect('/login');
});


app.get('/signup', (req, res) => {
    res.render('signup', { pageHeading: 'Signup', errorMessage: '' });
});

app.post('/signup', async (req, res) => {
    const { username, password, confirmPassword, userType } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.render('signup', { pageHeading: 'Signup', errorMessage: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.render('signup', { pageHeading: 'Signup', errorMessage: 'Passwords do not match' });
    }

    try {
        const existingUser = await DriveTest.findOne({ username });
        if (existingUser) {
            return res.render('signup', { pageHeading: 'Signup', errorMessage: 'Username already exists' });
        }

        const newUser = new DriveTest({
            username,
            password, 
            userType
        });

        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('signup', { pageHeading: 'Signup', errorMessage: 'Error saving user' });
    }
});


app.get('/login', (req, res) => {
    res.render('login', { pageHeading: 'Login', errorMessage: '' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { pageHeading: 'Login', errorMessage: 'Username and password are required' });
    }

    try {
        const user = await DriveTest.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('login', { pageHeading: 'Login', errorMessage: 'Invalid username or password' });
        }

        req.session.userId = user._id;
        req.session.userType = user.userType;

        if (user.userType === 'Driver') {
            res.redirect('/g2test');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.render('login', { pageHeading: 'Login', errorMessage: 'Error logging in' });
    }
});


app.get('/g2test', requireDriver, async (req, res) => {
    const user = await DriveTest.findById(req.session.userId);
    res.render('g2test', { pageHeading: 'G2 Test', user, message: '' });
});

app.post('/g2test/submit', requireDriver, async (req, res) => {
    const { firstName, lastName, licenceNumber, age, 'carDetails[make]': make, 'carDetails[model]': model, 'carDetails[year]': year, 'carDetails[plateNumber]': plateNumber } = req.body;

    try {
        const user = await DriveTest.findById(req.session.userId);
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.licenceNumber = licenceNumber || user.licenceNumber; 
        user.age = age || user.age;
        user.carDetails.make = make || user.carDetails.make;
        user.carDetails.model = model || user.carDetails.model;
        user.carDetails.year = year || user.carDetails.year;
        user.carDetails.plateNumber = plateNumber || user.carDetails.plateNumber;

        await user.save();
        res.render('g2test', { pageHeading: 'G2 Test', user, message: 'Booking successfully updated!' });
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).send('Error updating booking');
    }
});


app.get('/gtest', requireDriver, async (req, res) => {
    const user = await DriveTest.findById(req.session.userId);
    res.render('gtest', { pageHeading: 'G Test', user });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});


app.listen(4000, () => {
    console.log('App is running at port 4000');
});