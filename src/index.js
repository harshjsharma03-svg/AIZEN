// Entry point for Render deployment when root directory is set to 'src'
// This file imports and runs the main bot from the parent directory

const path = require('path');

// Change working directory to parent (project root)
process.chdir(path.join(__dirname, '..'));

// Now require and run the main bot
require('../index.js');