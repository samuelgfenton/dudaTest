const fs = require('fs');

const authHeader = JSON.parse(fs.readFileSync('auth-header.json', 'utf8'));
const settingsConfig = JSON.parse(fs.readFileSync('settings-config.json', 'utf8'));

function getPropertySettings(spid) {
    const property = settingsConfig.properties.find(p => p.spid === spid) || settingsConfig.properties[0];
    return {
        userID: settingsConfig.userID,
        firstName: settingsConfig.firstName,
        lastName: settingsConfig.lastName,
        permissions: settingsConfig.permissions,
        ...property
    };
}

module.exports = {
    authHeader,
    settingsConfig,
    getPropertySettings
};