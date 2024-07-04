// Import File Stream
const { existsSync, mkdirSync } = require('fs')

// Express Module
const express = require('express')

// Define the express application
const app = express()

// Import autoscaler module
const { autoScale } = require('./autoscaler')

// Cors Module
const cors = require('cors')

// Morgan Module
const morgan = require('morgan')

// Compression Module
const compression = require('compression')

// Cors middleware for origin and Headers
app.use(cors())

// Adding The 'body-parser' middleware only handles JSON and urlencoded data
app.use(express.json())

// Use Morgan middleware for logging every request status on console
app.use(morgan('dev'))

// Start the auto-scaler
autoScale().catch(error => console.error(`Auto-scaler encountered an error: ${error.message}`))

// Default Route
app.use('/', (req, res, next) => {
    res.status(200).json({ message: 'Server is Working!' })
})

// Invalid routes handling middleware
app.all('*', (req, res, next) => {
    const error = new Error('Not found, check your URL please!')
    error.status = 404
    next(error)
})

// Error handling middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: JSON.stringify(error)
        }
    })
})

// In case of an error
app.on('error', (appErr, appCtx) => {
    console.error('Application error: ', appErr.stack);
    console.error('On url: ', appCtx.req.url);
    console.error('With headers: ', appCtx.req.headers);
})

// Compressing the application
app.use(compression())

// Export the application
module.exports = app