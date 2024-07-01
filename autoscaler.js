// Node fetch module
const fetch = require('node-fetch');

// DotEnv Module
const dotenv = require('dotenv');

// Apply Environments
if (process.env.NODE_ENV != 'production') {

    // Load the config from the .env file
    dotenv.config()

}

// Base URL for the application's API
const BASE_URL = process.env.BASE_URL;

// Target CPU usage to maintain
const TARGET_CPU_USAGE = Number(process.env.TARGET_CPU_USAGE);

// Interval for polling the status (in milliseconds)
const POLLING_INTERVAL_MS = Number(process.env.POLLING_INTERVAL_MS);

// Function to get the current status of the application
async function getStatus() {
    try {
        const response = await fetch(`${BASE_URL}/status`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`Error fetching status: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch status: ${error.message}`);
        return null;
    }
}

// Function to update the number of replicas
async function updateReplicas(count) {
    try {
        const response = await fetch(`${BASE_URL}/replicas`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ replicas: count })
        });
        if (!response.ok) throw new Error(`Error updating replicas: ${response.statusText}`);
        return await response;
    } catch (error) {
        console.error(`Failed to update replicas: ${error.message}`);
    }
}

// Function to automatically adjust the number of replicas based on CPU usage
async function autoScale() {
    while (true) {
        // Fetch the current status of the application
        const status = await getStatus();
        if (!status) {
            console.log('Failed to retrieve status, retrying...');
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
            continue;
        }

        const currentCpu = status.cpu.highPriority;
        const currentReplicas = status.replicas;

        console.log(`Current CPU: ${currentCpu}, Current Replicas: ${currentReplicas}`);

        // Scale up if the current CPU usage is higher than the target
        if (currentCpu > TARGET_CPU_USAGE) {
            const newReplicas = Math.ceil(currentReplicas * (currentCpu / TARGET_CPU_USAGE));
            console.log(`Scaling up to ${newReplicas} replicas`);
            await updateReplicas(newReplicas);
        // Scale down if the current CPU usage is lower than the target
        } else if (currentCpu < TARGET_CPU_USAGE) {
            const newReplicas = Math.floor(currentReplicas * (currentCpu / TARGET_CPU_USAGE));
            if (newReplicas >= 1) {
                console.log(`Scaling down to ${newReplicas} replicas`);
                await updateReplicas(newReplicas);
            }
        }

        // Wait for the specified polling interval before checking again
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }
}

// Start the auto-scaler
autoScale().catch(error => console.error(`Auto-scaler encountered an error: ${error.message}`))