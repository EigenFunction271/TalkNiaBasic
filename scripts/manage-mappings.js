const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
    console.log('Channel Mappings Management Script');
    console.log('----------------------------------');
    
    try {
        // Try to load existing mappings
        let mappings = { bridges: [] };
        try {
            const content = await fs.readFile(path.join(__dirname, '..', 'config', 'channels.json'), 'utf8');
            mappings = JSON.parse(content);
        } catch (error) {
            console.log('No existing mappings found. Starting fresh.');
        }

        // Generate the environment variable format
        const envFormat = JSON.stringify(mappings);
        
        console.log('\nYour CHANNEL_MAPPINGS environment variable value:');
        console.log('------------------------------------------------');
        console.log(envFormat);
        console.log('------------------------------------------------');
        
        console.log('\nInstructions:');
        console.log('1. Copy the above value');
        console.log('2. Go to your Render dashboard');
        console.log('3. Add a new environment variable:');
        console.log('   - Key: CHANNEL_MAPPINGS');
        console.log('   - Value: Paste the copied value');
        
        // Save to a temporary file for backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, '..', 'config', `mappings-${timestamp}.txt`);
        await fs.writeFile(backupPath, envFormat);
        console.log(`\nBackup saved to: ${backupPath}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        rl.close();
    }
}

main(); 