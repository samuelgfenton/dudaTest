const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authHeader } = require('../config/config-loader');

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

    if (!response.ok) {
        throw new Error(`${operationName} failed. Status: ${response.status}. Response: ${responseText}`);
    }

    return responseText.length > 0 ? JSON.parse(responseText) : null;
}

router.get('/', async (req, res) => {
    try {
        const templatesData = await makeApiCall(
            'https://api-sandbox.duda.co/api/sites/multiscreen/templates',
            { headers: authHeader },
            'Get Templates'
        );
        
        const filteredTemplates = templatesData.filter(template => 
            template.template_name.toLowerCase().includes('siteminder'.toLowerCase())
        );

        res.json(filteredTemplates);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch templates' });
    }
});

router.get('/site/:siteName', async (req, res) => {
    try {
        const { siteName } = req.params;
        const templateData = await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/templates`,
            { headers: authHeader },
            'Get Site Templates'
        );
        
        res.json(templateData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch site template' });
    }
});

module.exports = router;