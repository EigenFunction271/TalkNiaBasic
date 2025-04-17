const https = require('https');

// Configuration
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const SERVICE_ID = process.env.RENDER_SERVICE_ID;
const RENDER_API_BASE = 'api.render.com/v1';

async function makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: RENDER_API_BASE,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${RENDER_API_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.end();
    });
}

async function cleanupDeployments() {
    try {
        console.log('Starting deployment cleanup...');

        // Get all deployments
        const deployments = await makeRequest(`/services/${SERVICE_ID}/deploys`);
        console.log(`Found ${deployments.length} total deployments`);

        // Filter for active deployments
        const activeDeployments = deployments.filter(d => d.status === 'live');
        console.log(`Found ${activeDeployments.length} active deployments`);

        if (activeDeployments.length <= 1) {
            console.log('No extra deployments to clean up');
            return;
        }

        // Sort by creation date, keep the newest one
        activeDeployments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const deploymentsToTerminate = activeDeployments.slice(1);

        console.log(`Terminating ${deploymentsToTerminate.length} old deployments...`);

        // Terminate old deployments
        for (const deploy of deploymentsToTerminate) {
            console.log(`Terminating deployment ${deploy.id}...`);
            await makeRequest(`/services/${SERVICE_ID}/deploys/${deploy.id}/terminate`, 'POST');
        }

        console.log('Cleanup completed successfully');
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

// Add to package.json scripts
module.exports = cleanupDeployments;

if (require.main === module) {
    if (!RENDER_API_KEY || !SERVICE_ID) {
        console.error('Error: RENDER_API_KEY and RENDER_SERVICE_ID environment variables are required');
        process.exit(1);
    }
    cleanupDeployments();
} 