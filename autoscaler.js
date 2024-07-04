// Node fetch module
const fetch = require('node-fetch')

// DotEnv Module
const dotenv = require('dotenv')

// Apply Environments
if (process.env.NODE_ENV != 'production') {

    // Load the config from the .env file
    dotenv.config()

}

// Base URL for the application's API
const BASE_URL = process.env.BASE_URL

// Target CPU usage to maintain
const TARGET_CPU_USAGE = Number(process.env.TARGET_CPU_USAGE)

// Interval for polling the status (in milliseconds)
const POLLING_INTERVAL_MS = Number(process.env.POLLING_INTERVAL_MS)

// Function to get the current status of the application
async function getStatus() {
    try {

         // Call HTTP API
        const response = await fetch(`${BASE_URL}/status`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        })

        // Return null if response is not ok
        if (!response.ok) return null

        // Respond with the response
        return await response.json()
    } catch (error) {

         // Print confirmation
        console.error(`\n Autoscaler \t: Failed to fetch status: ${error.message} \n`)

        // Return null
        return null
    }
}

// Function to update the number of replicas
async function updateReplicas(count) {
    try {

        // Call HTTP API
        const response = await fetch(`${BASE_URL}/replicas`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ replicas: count })
        })

        // Return null if response is not ok
        if (!response.ok) return null

        // Respond with the response
        return await response
    } catch (error) {

        // Print confirmation
        console.error(`\n Autoscaler \t: Failed to update replicas: ${error.message} \n`)

        // Return null
        return null
    }
}

// Function to automatically adjust the number of replicas based on CPU usage
async function autoScale() {
    while (true) {

        // Fetch the current status of the application
        const status = await getStatus()

        // If status was not found
        if (!status) {

            // Print confirmation
            console.log('\n Autoscaler \t: Failed to retrieve status, retrying... \n')

            // Set the promise to poll
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS))

            // Continue to call the status
            continue
        }

        // Procure the replicas and CPU
        const currentCpu = status.cpu.highPriority
        const currentReplicas = status.replicas

        // Print confirmation
        console.log(`\n Autoscaler \t: Current CPU: ${currentCpu}, Current Replicas: ${currentReplicas} \n`)

        // Scale up if the current CPU usage is higher than the target
        if (currentCpu > TARGET_CPU_USAGE) {

            // Fetch new replicas
            const newReplicas = Math.ceil(currentReplicas * (currentCpu / TARGET_CPU_USAGE))

            // Print confirmation
            console.log(`\n Autoscaler \t: Scaling up to ${newReplicas} replicas \n`)

            // Update Replicas
            await updateReplicas(newReplicas)

        // Scale down if the current CPU usage is lower than the target
        } else if (currentCpu < TARGET_CPU_USAGE) {

            // Fetch new replicas
            const newReplicas = Math.floor(currentReplicas * (currentCpu / TARGET_CPU_USAGE))

            // Print confirmation if scaling down
            if (newReplicas >= 1) {
                console.log(`\n Autoscaler \t: Scaling down to ${newReplicas} replicas \n`)

                // Update Replicas
                await updateReplicas(newReplicas)
            }
        }

        // Wait for the specified polling interval before checking again
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS))
    }
}

// Add exports
module.exports = { getStatus, updateReplicas, autoScale }