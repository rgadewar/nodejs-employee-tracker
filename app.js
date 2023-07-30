require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const app = express();
const { printTable } = require('console-table-printer');
const figlet = require('figlet');
const displayMainMenu = require('./employeeFunctions');
const connection = require('./config/connection');
const PORT = process.env.PORT || 3008;

// Define the root route
app.get('/', (req, res) => {
  res.send('Hello, this is the root page!');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

figlet('NODEJS Employee Tracker', (err, result) => {
  console.log(err || result);
});

connection.connect(function(err) {
  if (err) throw err;
  // Call the displayMainMenu function to start the application
  displayMainMenu();
});
