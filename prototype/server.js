const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Read auth header and settings from JSON files
const authHeader = JSON.parse(fs.readFileSync('authHeader.json', 'utf8'));
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

app.use(express.static('public'));

// API endpoint to check for existing site
app.get('/api/site', async (req, res) => {
    try {
        const response = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/byexternalid/${settings.spid}`, {
            headers: authHeader
        });

        if (response.ok) {
            const siteNames = await response.json();
            
            if (siteNames && siteNames.length > 0) {
                const siteDetailsResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${siteNames[0]}`, {
                    headers: authHeader
                });

                if (siteDetailsResponse.ok) {
                    const siteDetails = await siteDetailsResponse.json();
                    res.json({ 
                        hasSite: true,
                        siteName: siteNames[0],
                        siteDetails: siteDetails
                    });
                } else {
                    throw new Error(`Failed to get site details`);
                }
            } else {
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

// New endpoint to get templates
app.get('/api/templates', async (req, res) => {
    try {
        const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/templates', {
            headers: authHeader
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const templatesData = await response.json();
        // Filter for templates with "SiteMinder" in the name (case insensitive)
        const filteredTemplates = templatesData.filter(template => 
            template.template_name.toLowerCase().includes('siteminder'.toLowerCase())
        );

        res.json(filteredTemplates);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});