const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authHeader, getPropertySettings } = require('../config/config-loader');

router.get('/check', async (req, res) => {
    try {
        const settings = getPropertySettings(req.session.currentSpid);
        console.log('Checking account endpoint with settings:', settings);

        const endpoint = `https://api-sandbox.duda.co/api/accounts/${settings.userID}`;
        console.log('Using auth header:', authHeader);

        const response = await fetch(endpoint, {
            headers: authHeader
        });
        
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response data:', responseText);

        // Both 404 and 400 indicate the account doesn't exist
        if (response.status === 404 || response.status === 400) {
            console.log('Account not found - this is expected for new accounts');
            return res.json({ exists: false });
        }
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('Account exists, returning data');
            return res.json({ exists: true, data });
        }
        
        // If we get here, it's an unexpected error
        throw new Error(`Unexpected HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to check account' });
    }
});

router.post('/create', async (req, res) => {
    try {
        const settings = getPropertySettings(req.session.currentSpid);
        
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

        const response = await fetch('https://api-sandbox.duda.co/api/accounts/create', {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountData)
        });

        console.log('Create account response status:', response.status);
        const responseText = await response.text();
        console.log('Create account response:', responseText);

        // Handle 204 No Content separately
        if (response.status === 204) {
            return res.json({
                success: true,
                message: 'Account created successfully'
            });
        }

        // Try to parse JSON only if we have content
        let data;
        if (responseText && responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                // If we can't parse the response but got a successful status code, consider it a success
                if (response.ok) {
                    return res.json({
                        success: true,
                        message: 'Account created successfully'
                    });
                }
                throw new Error('Invalid response format');
            }
        }

        if (!response.ok) {
            throw new Error(data?.message || `HTTP error! status: ${response.status}`);
        }

        res.json({
            success: true,
            data: data || { message: 'Account created successfully' }
        });
    } catch (error) {
        console.error('Detailed create error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to create account' 
        });
    }
});

module.exports = router;