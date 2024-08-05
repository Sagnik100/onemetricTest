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

// Asynchronous function to delete a plan by its ID
exports.deletePlan = async (event) => {
  // Extract plan ID from the path parameters
  const planId = event.pathParameters.id;

  try {
    // Execute DELETE query to remove the plan from the database
    const [result] = await pool.query('DELETE FROM plans WHERE id = ?', [planId]);

    // Check if any rows were affected 
    if (result.affectedRows === 0) {
      return {
        statusCode: 404, // Not Found status code
        headers: { 'Authorization-Status': 'false' },
        body: JSON.stringify({ error: true, message: 'Plan not found' }),
      };
    }

    // Return success response if plan was deleted
    return {
      statusCode: 200, // OK status code
      headers: { 'Authorization-Status': 'true' },
      body: JSON.stringify({
        success: true,
        data: { message: 'Plan deleted successfully' },
      }),
    };
  } catch (error) {
    // Log error details for debugging purposes
    console.error('Error deleting plan:', error);

    // Return error response if an exception occurred
    return {
      statusCode: 500, // Internal Server Error status code
      headers: { 'Authorization-Status': 'false' },
      body: JSON.stringify({ error: true, message: 'Failed to delete plan' }),
    };
  }
};
