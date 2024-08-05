// Import necessary modules and packages
const mysql = require('mysql2/promise'); // MySQL module for connecting and executing queries
const Razorpay = require('razorpay'); // Razorpay module for payment processing
const { v4: uuidv4 } = require('uuid'); // UUID module for generating unique identifiers
require('dotenv').config(); // dotenv module for loading environment variables

// Database configuration object, values are fetched from environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Razorpay configuration object with key id and secret
const razorpayConfig = {
    key_id: 'rzp_test_R5tlDvzNSdEuY4', // Razorpay test key id
    key_secret: 'WOCQDhSZNaPPOqSn6xiKZZVo', // Razorpay test key secret
};

// Initialize Razorpay instance with the configuration
const razorpayInstance = new Razorpay(razorpayConfig);

// Asynchronous function to create a payment
const createPayment = async (event) => {
    // Extract user_id and plan_id from the event body
    const { user_id, plan_id } = JSON.parse(event.body);

    // Establish a connection to the MySQL database
    const connection = await mysql.createConnection(dbConfig);

    try {
        // Fetch user details from the database using user_id
        const [userRows] = await connection.execute('SELECT * FROM users WHERE id = ?', [user_id]);
        if (userRows.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Authorization-Status': 'false' },
                body: JSON.stringify({ error: true, message: 'User not found' }),
            };
        }
        const user = userRows[0]; // User details

        // Fetch plan details from the database using plan_id
        const [planRows] = await connection.execute('SELECT * FROM plans WHERE id = ?', [plan_id]);
        if (planRows.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Authorization-Status': 'false' },
                body: JSON.stringify({ error: true, message: 'Plan not found' }),
            };
        }
        const plan = planRows[0]; // Plan details

        // Create an order in Razorpay with the plan amount in paise
        const orderOptions = {
            amount: plan.amount_in_rs * 100, // Amount in paise
            currency: 'INR', // Currency in Indian Rupees
            receipt: uuidv4(), // Unique receipt identifier
            payment_capture: 1, // Automatic capture of payment
        };
        const order = await razorpayInstance.orders.create(orderOptions); // Create order

        // Insert transaction details into the database
        const [result] = await connection.execute(
            'INSERT INTO transactions (payment_order_id, amount, created_at, updated_at, user_id, plan_id, status) VALUES (?, ?, NOW(), NOW(), ?, ?, ?)',
            [order.id, plan.amount_in_rs, user_id, plan_id, false]
        );

        // Close the database connection
        await connection.end();

        // Return success response with transaction details
        return {
            statusCode: 200,
            headers: { 'Authorization-Status': 'true' },
            body: JSON.stringify({
                success: true,
                data: {
                    transaction_id: result.insertId,
                    payment_order_id: order.id,
                    amount: plan.amount_in_rs,
                    user_id: user_id,
                    plan_id: plan_id,
                    status: 'pending',
                },
            }),
        };
    } catch (error) {
        // Close the database connection in case of error
        await connection.end();

        // Return error response with error message
        return {
            statusCode: 500,
            headers: { 'Authorization-Status': 'false', 'Error': error.message },
            body: JSON.stringify({ error: true, message: 'Internal server error' }),
        };
    }
};

// Export the createPayment function as a module
module.exports = { createPayment };
