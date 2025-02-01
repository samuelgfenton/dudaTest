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

    // Special handling for 404 and 400 in account check
    if (operationName === 'Check Account' && (response.status === 404 || response.status === 400)) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`${operationName} failed. Status: ${response.status}. Response: ${responseText}`);
    }

    return responseText.length > 0 ? JSON.parse(responseText) : null;
}

router.get('/check', async (req, res) => {
    try {
        const endpoint = `https://api-sandbox.duda.co/api/accounts/${settings.userID}`;
        console.log('Checking account endpoint:', endpoint);

        const accountData = await makeApiCall(
            endpoint,
            { headers: authHeader },
            'Check Account'
        );

        if (!accountData) {
            console.log('Account not found - this is expected for new accounts');
            return res.json({ exists: false });
        }

        console.log('Account exists, returning data');
        return res.json({ exists: true, data: accountData });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: error.message || 'Failed to check account' });
    }
});

router.post('/create', async (req, res) => {
    try {
        const accountData = {
            "account_type": "CUSTOMER",
            "account_name": settings.userID,
            "first_name": settings.firstName,
            "last_name": settings.lastName,
            "lang": "en",
            "email": settings.userID,
            "company_name": "company"
        };

        console.log('Creating account with data:', accountData);

        const data = await makeApiCall(
            'https://api-sandbox.duda.co/api/accounts/create',
            {
                method: 'POST',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            },
            'Create Account'
        );

        // Handle both 204 No Content and successful JSON response
        res.json({
            success: true,
            data: data || { message: 'Account created successfully' }
        });
    } catch (error) {
        console.error('Detailed create error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to create account' 
        });
    }
});

module.exports = router;