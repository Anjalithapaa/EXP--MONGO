const express = require('express');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Connection URI
const uri = "mongodb+srv://anjali:hello123@cluster0.vsrl173.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Default route.
app.get('/', function(req, res) {
    var outstring = 'Default endpoint starting on date: ' + Date.now();
    outstring += '<p><a href=\"./register-form\">Register</a></p>';
    outstring += '<p><a href=\"./login-form\">Login</a></p>';
    res.send(outstring);
});

// MongoDB Connection
async function connectToDatabase() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return client.db('anjali').collection('loginCredentials');
}

// Task 2: Registration form
app.get('/register-form', function(req, res) {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Registration</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 10px;
                }
                input[type="text"],
                input[type="password"] {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    box-sizing: border-box;
                }
                input[type="submit"] {
                    width: 100%;
                    padding: 10px;
                    border: none;
                    border-radius: 3px;
                    background-color: #007bff;
                    color: #fff;
                    cursor: pointer;
                }
                input[type="submit"]:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>User Registration</h1>
                <form action="/register" method="post">
                    <label for="userID">User ID:</label>
                    <input type="text" id="userID" name="userID" required>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                    <input type="submit" value="Register">
                </form>
            </div>
        </body>
        </html>
    `);
});

// Task 2: Registration functionality
app.post('/register', async function(req, res) {
    const credentialsCollection = await connectToDatabase();
    const { userID, password } = req.body;
    try {
        // Insert registration credentials into the database
        await credentialsCollection.insertOne({ userID, password });
        res.send('Registration successful.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Registration failed.');
    }
});

// Task 3: Login form
app.get('/login-form', function(req, res) {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Login</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 10px;
                }
                input[type="text"],
                input[type="password"] {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    box-sizing: border-box;
                }
                input[type="submit"] {
                    width: 100%;
                    padding: 10px;
                    border: none;
                    border-radius: 3px;
                    background-color: #007bff;
                    color: #fff;
                    cursor: pointer;
                }
                input[type="submit"]:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>User Login</h1>
                <form action="/login" method="post">
                    <label for="userID">User ID:</label>
                    <input type="text" id="userID" name="userID" required>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                    <input type="submit" value="Login">
                </form>
            </div>
        </body>
        </html>
    `);
});

// Task 3: Login functionality
app.post('/login', async function(req, res) {
    const credentialsCollection = await connectToDatabase();
    const { userID, password } = req.body;
    try {
        // Check if login credentials exist in the database
        const user = await credentialsCollection.findOne({ userID, password });
        if (user) {
            // Generate authentication cookie
            res.cookie('auth', 'authenticated', { maxAge: 60000 }); // Expires in 1 minute
            res.send('Login successful.');
        } else {
            res.send('Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Login failed.');
    }
});

// Task 4: Include links to a route that prints all active cookies and clears cookies
app.get('/cookies', function(req, res) {
    res.send(`
        <p><a href="/active-cookies">Active Cookies</a></p>
        <p><a href="/clear-cookies">Clear Cookies</a></p>
    `);
});

// Middleware to print all active cookies
app.get('/active-cookies', function(req, res) {
    console.log('Active Cookies:', req.cookies);
    res.send('Active Cookies: ' + JSON.stringify(req.cookies));
});

// Route to clear all cookies
app.get('/clear-cookies', function(req, res) {
    res.clearCookie('auth');
    res.send('All cookies cleared. <a href="/">Go back</a>');
});

// Start the server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
