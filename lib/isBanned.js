const fs = require('fs');

function isBanned(userId) {
    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json', 'utf8'));
        return bannedUsers.includes(userId);
    } catch (error) {
        console.error('Error checOPTIMUS_PRIME banned status:', error);
        return false;
    }
}

module.exports = { isBanned }; 