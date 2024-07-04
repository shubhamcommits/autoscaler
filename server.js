// Import File Stream Module
const { Readable } = require('stream')

// Import Cluster Module
const cluster = require('cluster')

// DotEnv Module
const dotenv = require('dotenv')

// Fetch Number of CPU Cores
const { cpus } = require('os')

// Apply Environments
if (process.env.NODE_ENV != 'production') {

    // Load the config from the .env file
    dotenv.config()

}

// Express App
const app = require('./app')

// HTTP Module
const { createServer } = require('http')

// Cluster variable
const isClusterRequired = process.env.CLUSTER

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
const setupWorkerProcesses = () => {

    // Console the confirmation
    console.info(`\n Master cluster is setting up ` + cpus.length + ' workers \n')
    console.info(`\n Master PID: ${process.pid} is running \n`)

    // Fork workers
    Readable.from(cpus)
        .on('data', (cpu) => {
            console.info(`\n Message: ${cpu.model} is starting ... \n`)
            cluster.fork()
        })

    // Handle Message from Cluster
    cluster.on('message', function (message) {
        console.info(`\n Message: ${message} \n`)
    })

    // Handle online
    cluster.on('online', (worker) => {
        console.info(`\n Worker ID: ${worker.id} and the PID: ${worker.process.pid} \n`)
    })

    // Handle on exit
    cluster.on('exit', (worker, code, signal) => {
        console.info(`\n Worker ID: ${worker.id} with PID: ${worker.process.pid} died with CODE: ${code} and SIGNAL: ${signal} \n`)
        console.info(`\n Forking another Worker \n`)
        cluster.fork()
    })

    // Handle on error
    cluster.on('error', (error) => {
        console.info(`\n Error: ${error} \n`)
    })

}

/**
 * Setup an express server and define port to listen all incoming requests for this application
 */
const setUpExpressApplication = async () => {

    // Define Application port
    const port = process.env.PORT

    // Defining the Host Name
    const host = process.env.HOST

    // Environment State Variable
    const env = process.env.NODE_ENV

    // Creating Microservice Server
    const server = createServer(app)

    // Exposing the server to the desired port
    server.listen(port, host, async () => {
        console.info(`\n Service \t: http://${host}:${port} \n`)
        console.info(`\n Environment \t: ${env} \n`)
        console.info(`\n Process \t: ${process.pid} is listening to all incoming requests \n`)
    })
}

/**
 * Setup server either with clustering or without it
 * @param isClusterRequired
 * @constructor
 */

// If it is a master process then call setting up worker process
if (isClusterRequired == 'true' && cluster.isMaster) {

    setupWorkerProcesses()

} else {

    // To setup server configurations and share port address for incoming requests
    setUpExpressApplication()
}