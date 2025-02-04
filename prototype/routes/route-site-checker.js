const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authHeader, getPropertySettings } = require('../config/config-loader');

router.get('/', async (req, res) => {
    try {
        const settings = getPropertySettings(req.session.currentSpid);
        console.log('Fetching sites for SPID:', settings.spid);

        const response = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/byexternalid/${settings.spid}`, {
            headers: authHeader
        });

        console.log('Site response status:', response.status);
        const siteNames = await response.json();
        console.log('Site names received:', siteNames);

        if (response.ok) {
            if (siteNames && siteNames.length > 0) {
                console.log('Found site name:', siteNames[0]);
                const siteDetailsResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${siteNames[0]}`, {
                    headers: authHeader
                });

                console.log('Site details response status:', siteDetailsResponse.status);
                
                if (siteDetailsResponse.ok) {
                    const siteDetails = await siteDetailsResponse.json();
                    console.log('Site details:', siteDetails);
                    res.json({ 
                        hasSite: true,
                        siteName: siteNames[0],
                        siteDetails: siteDetails
                    });
                } else {
                    throw new Error(`Failed to get site details`);
                }
            } else {
                console.log('No sites found');
                res.json({ hasSite: false });
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch site data' });
    }
});

router.post('/grant-access/:siteName', async (req, res) => {
    try {
        const { siteName } = req.params;
        const settings = getPropertySettings(req.session.currentSpid);
        
        const permissions = {
            "permissions": settings.permissions
        };

        const response = await fetch(`https://api-sandbox.duda.co/api/accounts/${settings.userID}/sites/${siteName}/permissions`, {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(permissions)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to grant site access' });
    }
});

router.get('/sso-link/:siteName', async (req, res) => {
    try {
        const { siteName } = req.params;
        const settings = getPropertySettings(req.session.currentSpid);
        
        const response = await fetch(`https://api-sandbox.duda.co/api/accounts/sso/${settings.userID}/link?site_name=${siteName}&target=SITE_OVERVIEW`, {
            headers: authHeader
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get SSO link' });
    }
});

module.exports = router;