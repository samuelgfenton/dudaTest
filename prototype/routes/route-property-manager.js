const express = require('express');
const router = express.Router();
const { settingsConfig, getPropertySettings } = require('../config/config-loader');

// Get all properties with current property marked
router.get('/', async (req, res) => {
    try {
        // Get current SPID from session or default to first property
        const currentSpid = req.session?.currentSpid || settingsConfig.properties[0].spid;
        console.log('Current SPID:', currentSpid);

        const properties = settingsConfig.properties.map(property => ({
            ...property,
            current: property.spid === currentSpid
        }));

        console.log('Returning properties:', properties);
        res.json(properties);
    } catch (error) {
        console.error('Error getting properties:', error);
        res.status(500).json({ error: 'Failed to get properties' });
    }
});

// Switch current property
router.post('/switch', async (req, res) => {
    try {
        const { spid } = req.body;
        console.log('Switching to property:', spid);
        
        // Validate SPID exists in properties
        const propertyExists = settingsConfig.properties.some(p => p.spid === spid);
        if (!propertyExists) {
            throw new Error('Invalid property ID');
        }

        // Store new SPID in session
        req.session.currentSpid = spid;
        console.log('Session updated with new SPID:', req.session.currentSpid);
        
        res.json({ 
            success: true,
            settings: getPropertySettings(spid)
        });
    } catch (error) {
        console.error('Error switching property:', error);
        res.status(500).json({ error: 'Failed to switch property' });
    }
});

module.exports = router;