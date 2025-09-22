const fs = require('fs');
const path = require('path');

// Utility to clean up old temp files
function cleanupTempFiles() {
    try {
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            return;
        }

        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        let cleaned = 0;

        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            try {
                const stats = fs.statSync(filePath);
                // Delete files older than 1 hour
                if (now - stats.mtime.getTime() > 3600000) {
                    fs.unlinkSync(filePath);
                    cleaned++;
                }
            } catch (error) {
                console.error(`Error processing temp file ${file}:`, error);
            }
        });

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} old temp files`);
        }
    } catch (error) {
        console.error('Error during temp cleanup:', error);
    }
}

// Create temp directory if it doesn't exist
function ensureTempDir() {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log('📁 Created temp directory');
    }
}

// Run cleanup every 30 minutes
setInterval(cleanupTempFiles, 30 * 60 * 1000);

// Initial setup
ensureTempDir();
cleanupTempFiles();

module.exports = {
    cleanupTempFiles,
    ensureTempDir
};