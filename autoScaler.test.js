// Import autoscaler module
const { getStatus, updateReplicas, autoScale } = require('./autoscaler')

// Node fetch module
const fetch = require('node-fetch')

// Mock the fetch module to simulate API responses
jest.mock('node-fetch')

describe('Autoscaler', () => {
    let originalConsoleError

    // Setup environment variables and mock console.error before each test
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.BASE_URL = 'http://localhost:8123/app'
        process.env.TARGET_CPU_USAGE = 50
        process.env.POLLING_INTERVAL_MS = 100

        // Mock console.error to avoid cluttering the test output
        originalConsoleError = console.error
        console.error = jest.fn()
    })

    // Restore console.error after each test
    afterEach(() => {
        console.error = originalConsoleError
    })

    // Test getStatus function when the API call is successful
    test('getStatus should return status when API call is successful', async () => {
        const mockStatus = { cpu: { highPriority: 60 }, replicas: 5 }
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockStatus
        })

        const status = await getStatus()
        expect(status).toEqual(mockStatus)
    })

    // Test getStatus function when the API call fails
    test('getStatus should return null when API call fails', async () => {
        fetch.mockResolvedValue({ ok: false })

        const status = await getStatus()
        expect(status).toBeNull()
    })

    // Test getStatus function when an error occurs during the API call
    test('getStatus should return null when an error occurs', async () => {
        fetch.mockRejectedValue(new Error('Failed to fetch'))

        const status = await getStatus()
        expect(status).toBeNull()
    })

    // Test updateReplicas function when the API call is successful
    test('updateReplicas should return response when API call is successful', async () => {
        fetch.mockResolvedValue({ ok: true })

        const response = await updateReplicas(10)
        expect(response).not.toBeNull()
    })

    // Test updateReplicas function when the API call fails
    test('updateReplicas should return null when API call fails', async () => {
        fetch.mockResolvedValue({ ok: false })

        const response = await updateReplicas(10)
        expect(response).toBeNull()
    })

    // Test updateReplicas function when an error occurs during the API call
    test('updateReplicas should return null when an error occurs', async () => {
        fetch.mockRejectedValue(new Error('Failed to update replicas'))

        const response = await updateReplicas(10)
        expect(response).toBeNull()
    })
})