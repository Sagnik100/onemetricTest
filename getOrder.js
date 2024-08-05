// Import necessary modules and packages
const mysql = require('mysql2/promise'); // MySQL module for connecting and executing queries
require('dotenv').config(); // dotenv module for loading environment variables

// Asynchronous function to get order details by ID
const getOrder = async (event) => {
    // Extract order ID from the path parameters
    const { id } = event.pathParameters;

    // Establish a connection to the MySQL database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // Execute SELECT query to retrieve order details from the transactions table
        const [rows] = await connection.execute('SELECT * FROM transactions WHERE id = ?', [id]);
        
        // Close the database connection
        await connection.end();

        // Check if any rows were returned (i.e., order was found)
        if (rows.length > 0) {
            return {
                statusCode: 200, // OK status code
                headers: { 'Authorization-Status': 'true' },
                body: JSON.stringify({ success: true, data: rows[0] }),
            };
        } else {
            // Return 404 response if no order was found
            return {
                statusCode: 404, // Not Found status code
                headers: { 'Authorization-Status': 'false' },
                body: JSON.stringify({ error: true, message: 'Order not found' }),
            };
        }
    } catch (error) {
        // Close the database connection in case of an error
        await connection.end();
        
        // Log error details for debugging purposes
        console.error('Error retrieving order:', error);

        // Return error response if an exception occurred
        return {
            statusCode: 500, // Internal Server Error status code
            headers: { 'Authorization-Status': 'false' },
            body: JSON.stringify({ error: true, message: 'Could not retrieve order' }),
        };
    }
};

// Export the handler function to be used as a Lambda function
exports.handler = getOrder;
