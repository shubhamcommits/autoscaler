# Auto-Scaler

## Description
This application automatically adjusts the number of replicas of a separate application based on CPU utilization metrics to maintain an average CPU usage of 0.80 (80%).

## Features
- Monitors CPU usage and adjusts replicas accordingly.
- Logs important actions and errors.
- Configurable settings for target CPU usage, polling interval, and minimum replicas.

## Installation & Running the app
1. Clone the repository.
2. Grant permission to both of the darwin files like this -  `sudo chmod +x ./scaleit-darwin-amd64`
3. Execute the files using the terminal to spin up application at port 8123 - `./scaleit-darwin-amd64`
2. Make sure we have `.env` file in the root of your repository to start our autoscaler
2. Install dependencies using npm:
   ```bash
   npm install
3. Run the autoscaler using and monitor the logs:
   ```bash
   npm run dev