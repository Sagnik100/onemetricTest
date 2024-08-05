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

// Asynchronous function to create a new plan
exports.createPlan = async (event) => {
  try {
    // Parse the request body to extract amount and duration
    const body = JSON.parse(event.body);
    const { amount_in_rs, duration_in_months } = body;

    // Validate the input data
    if (!amount_in_rs || !duration_in_months) {
      return {
        statusCode: 400, // Bad Request status code
        headers: { 'Authorization-Status': 'false' },
        body: JSON.stringify({ error: true, message: 'Invalid input' }),
      };
    }

    // Insert new plan into the plans table
    const [result] = await pool.query(
      'INSERT INTO plans (amount_in_rs, duration_in_months) VALUES (?, ?)',
      [amount_in_rs, duration_in_months]
    );

    // Return success response with the new plan details
    return {
      statusCode: 201, // Created status code
      headers: { 'Authorization-Status': 'true' },
      body: JSON.stringify({
        success: true,
        data: {
          id: result.insertId, // Inserted plan ID
          amount_in_rs,
          duration_in_months
        }
      }),
    };
  } catch (error) {
    // Log error details for debugging purposes
    console.error('Error creating plan:', error);

    // Return error response with error message
    return {
      statusCode: 500, // Internal Server Error status code
      headers: { 'Authorization-Status': 'false' },
      body: JSON.stringify({ error: true, message: 'Internal server error' }),
    };
  }
};
