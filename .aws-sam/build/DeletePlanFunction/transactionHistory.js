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

// Asynchronous function to retrieve transaction history for a specific user
exports.transactionHistoryAPI = async (event) => {
  // Extract user ID from the path parameters
  const userId = event.pathParameters.user_id;

  try {
    // Execute SELECT query to retrieve transaction details for the specified user
    const [rows] = await pool.query(
      `SELECT 
        t.id AS transaction_id,
        t.payment_order_id,
        t.amount,
        t.created_at,
        t.updated_at,
        t.status,
        p.amount_in_rs,
        p.duration_in_months
      FROM 
        transactions t
      JOIN 
        registered_user_plans rup ON t.id = rup.transaction_id
      JOIN 
        plans p ON t.plan_id = p.id
      WHERE 
        t.user_id = ?`,
      [userId]
    );

    // Check if any transactions were found for the specified user
    if (rows.length === 0) {
      return {
        statusCode: 404, // Not Found status code
        headers: { 'Authorization-Status': 'false' },
        body: JSON.stringify({ error: true, message: 'No transactions found for this user' }),
      };
    }

    // Return success response with the list of transactions
    return {
      statusCode: 200, // OK status code
      headers: { 'Authorization-Status': 'true' },
      body: JSON.stringify({
        success: true,
        data: rows,
      }),
    };
  } catch (error) {
    // Log error details for debugging purposes
    console.error('Error fetching transaction history:', error);

    // Return error response if an exception occurred
    return {
      statusCode: 500, // Internal Server Error status code
      headers: { 'Authorization-Status': 'false' },
      body: JSON.stringify({ error: true, message: 'Failed to fetch transaction history' }),
    };
  }
};
