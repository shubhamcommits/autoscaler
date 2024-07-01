# Auto-Scaler

## Description
This application automatically adjusts the number of replicas of a separate application based on CPU utilization metrics to maintain an average CPU usage of 0.80 (80%).

## Features
- Monitors CPU usage and adjusts replicas accordingly.
- Logs important actions and errors.
- Configurable settings for target CPU usage, polling interval, and minimum replicas.

## Installation & Running the app
1. Clone the repository.
2. Make sure you have `.env` file in the root of your repository
2. Install dependencies using npm:
   ```bash
   npm install
3. Run the application using:
   ```bash
   npm run dev