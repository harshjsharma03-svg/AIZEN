// Entry point for Render deployment when root directory is set to 'src'
// This file imports and runs the main bot from the parent directory

const path = require('path');

// Change working directory to parent (project root)
const rootDir = path.join(__dirname, '..');
process.chdir(rootDir);

// Add parent directory to module resolution path
if (!module.paths.includes(rootDir)) {
    module.paths.unshift(path.join(rootDir, 'node_modules'));
}

// Clear module cache to ensure clean loading
delete require.cache[require.resolve('../index.js')];

// Now require and run the main bot
try {
    require('../index.js');
} catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
}