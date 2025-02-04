const fetch = require('node-fetch');
const { authHeader, getPropertySettings } = require('../../config/config-loader');
const { hexToRgb, delay } = require('../../utils/helpers');
const { updateTheme, updateContent, updateCollections, updateLanguages } = require('./siteUpdates');

async function createSite(req, res) {
    try {
        const settings = getPropertySettings(req.session.currentSpid);
        const { templateId } = req.body;
        console.log('Creating site with template:', templateId, 'for property:', settings.propertyName);
        
        const createSiteData = {
            "site_data": {
                "external_uid": settings.spid,
                "site_business_info": {
                    "business_name": settings.propertyName
                }
            },
            "template_id": templateId,
            "default_domain_prefix": settings.channelCode,
            "lang": settings.defaultLanguage
        };

        console.log('Creating site with data:', createSiteData);

        const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/create', {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createSiteData)
        });

        const responseText = await response.text();
        console.log('Create site response status:', response.status);
        console.log('Create site response:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing response:', e);
            throw new Error('Invalid response format from server');
        }

        await delay(500);

        // Update site settings
        await updateTheme(data.site_name, settings);
        await updateContent(data.site_name, settings);
        await updateCollections(data.site_name, settings);
        await updateLanguages(data.site_name, settings);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Detailed create error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to create site' 
        });
    }
}

module.exports = { createSite };