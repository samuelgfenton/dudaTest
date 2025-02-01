const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authHeader, settings } = require('../config/config-loader');

// Helper function for API calls with proper logging
async function makeApiCall(url, options, operationName) {
    console.log(`Making ${operationName} API call to:`, url);
    if (options.body) {
        console.log(`${operationName} request body:`, options.body);
    }
    
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    console.log(`${operationName} response status:`, response.status);
    console.log(`${operationName} response body:`, responseText);

    if (!response.ok && response.status !== 404) { // Allow 404 for site check
        throw new Error(`${operationName} failed. Status: ${response.status}. Response: ${responseText}`);
    }

    return responseText.length > 0 ? JSON.parse(responseText) : null;
}

router.get('/', async (req, res) => {
    try {
        console.log('Fetching sites for SPID:', settings.spid);
        const siteNames = await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/byexternalid/${settings.spid}`,
            { headers: authHeader },
            'Get Sites By External ID'
        );

        if (siteNames && siteNames.length > 0) {
            console.log('Found site name:', siteNames[0]);
            const siteDetails = await makeApiCall(
                `https://api-sandbox.duda.co/api/sites/multiscreen/${siteNames[0]}`,
                { headers: authHeader },
                'Get Site Details'
            );

            res.json({ 
                hasSite: true,
                siteName: siteNames[0],
                siteDetails: siteDetails
            });
        } else {
            console.log('No sites found');
            res.json({ hasSite: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch site data' });
    }
});

router.post('/grant-access/:siteName', async (req, res) => {
    try {
        const { siteName } = req.params;
        
        const permissions = {
            "permissions": [
                "STATS_TAB",
                "EDIT",
                "ADD_FLEX",
                "PUBLISH",
                "REPUBLISH",
                "INSITE",
                "SEO",
                "BACKUPS",
                "CUSTOM_DOMAIN",
                "RESET",
                "PUSH_NOTIFICATIONS",
                "LIMITED_EDITING",
                "CONTENT_LIBRARY",
                "AI_ASSISTANT",
                "SEO_OVERVIEW"
            ]
        };

        await makeApiCall(
            `https://api-sandbox.duda.co/api/accounts/${settings.userID}/sites/${siteName}/permissions`,
            {
                method: 'POST',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(permissions)
            },
            'Grant Site Access'
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to grant site access' });
    }
});

router.get('/sso-link/:siteName', async (req, res) => {
    try {
        const { siteName } = req.params;
        
        const ssoData = await makeApiCall(
            `https://api-sandbox.duda.co/api/accounts/sso/${settings.userID}/link?site_name=${siteName}&target=SITE_OVERVIEW`,
            { headers: authHeader },
            'Get SSO Link'
        );

        res.json(ssoData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to get SSO link' });
    }
});

module.exports = router;