const express = require('express');
const inquirer = require('inquirer');
const app = express();
const pool = require('./config/connection');
// app.js
const displayMainMenu = require('./employeeFunctions');

const PORT = process.env.PORT || 3008;

// Define the root route
app.get('/', (req, res) => {
  res.send('Hello, this is the root page!');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Call the displayMainMenu function to start the application
displayMainMenu();
