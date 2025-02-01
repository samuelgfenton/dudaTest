const fs = require('fs');

const authHeader = JSON.parse(fs.readFileSync('auth-header.json', 'utf8'));
const rawSettings = JSON.parse(fs.readFileSync('settings-config.json', 'utf8'));

// Add default values for new fields if they don't exist
const settings = {
    ...rawSettings,
    firstName: rawSettings.firstName || 'Sam',
    lastName: rawSettings.lastName || 'Fenton'
};

module.exports = {
    authHeader,
    settings
};