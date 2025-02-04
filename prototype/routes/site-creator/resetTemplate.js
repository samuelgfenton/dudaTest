const fetch = require('node-fetch');
const { authHeader, getPropertySettings } = require('../../config/config-loader');
const { delay } = require('../../utils/helpers');
const { updateTheme, updateContent, updateCollections, updateLanguages } = require('./siteUpdates');

async function resetTemplate(req, res) {
    try {
        const { siteName, templateId } = req.body;
        const settings = getPropertySettings(req.session.currentSpid);
        console.log('Reset template request received:', { siteName, templateId, settings });
        
        // Reset to new template
        const resetData = {
            "site_data": {
                "removeBizInfos": true
            },
            "template_id": templateId
        };

        console.log('Reset template request data:', resetData);

        const resetResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/reset/${siteName}`, {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(resetData)
        });

        // Capture the response text first for logging
        const resetResponseText = await resetResponse.text();
        console.log('Reset template response status:', resetResponse.status);
        console.log('Reset template raw response:', resetResponseText);

        if (!resetResponse.ok) {
            throw new Error(`Failed to reset template. Status: ${resetResponse.status}. Response: ${resetResponseText}`);
        }

        await delay(500);

        // Update site settings
        await updateTheme(siteName, settings);
        await updateContent(siteName, settings);
        await updateCollections(siteName, settings);
        await updateLanguages(siteName, settings);

        res.json({
            success: true
        });
    } catch (error) {
        console.error('Detailed reset error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to reset template' 
        });
    }
}

module.exports = { resetTemplate };