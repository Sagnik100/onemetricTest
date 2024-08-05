// Import necessary modules and packages
const mysql = require('mysql2/promise'); // MySQL module for connecting and executing queries
require('dotenv').config(); // dotenv module for loading environment variables

// Database configuration object, values are fetched from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a connection pool to manage multiple connections
const pool = mysql.createPool(dbConfig);

// Asynchronous function to retrieve a list of plans from the database
exports.getPlanList = async () => {
  try {
    // Execute SELECT query to retrieve all plans from the plans table
    const [rows] = await pool.query('SELECT * FROM plans');
    
    // Return success response with the list of plans
    return {
      statusCode: 200, // OK status code
      headers: { 'Authorization-Status': 'true' },
      body: JSON.stringify({ success: true, data: rows }),
    };
  } catch (error) {
    // Log error details for debugging purposes
    console.error('Error fetching plan list:', error);
    
    // Return error response if an exception occurred
    return {
      statusCode: 500, // Internal Server Error status code
      headers: { 'Authorization-Status': 'false', 'Error': 'Internal server error' },
      body: JSON.stringify({ error: true, message: 'Internal server error' }),
    };
  }
};
