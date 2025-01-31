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
app.use(express.json());

function hexToRgb(hex) {
    // Remove the hash if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r},${g},${b}`;
}

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

app.get('/api/templates', async (req, res) => {
    try {
        const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/templates', {
            headers: authHeader
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const templatesData = await response.json();
        const filteredTemplates = templatesData.filter(template => 
            template.template_name.toLowerCase().includes('siteminder'.toLowerCase())
        );

        res.json(filteredTemplates);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

app.post('/api/create-site', async (req, res) => {
    try {
        const { templateId } = req.body;
        
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

        const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/create', {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createSiteData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Add a small delay to ensure site is ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the theme
        const themeData = {
            "colors": [
                {
                    "id": "color_1",
                    "value": "rgba(247,247,247,1)",
                    "label": "Primary"
                },
                {
                    "id": "color_2",
                    "value": "rgba(70,57,57,1)",
                    "label": "Secondary"
                },
                {
                    "id": "color_3",
                    "value": `rgba(${hexToRgb(settings.colorHex)},1)`,
                    "label": "Color #3"
                },
                {
                    "id": "color_4",
                    "value": "rgba(226, 226, 226, 1)",
                    "label": "Color #4"
                },
                {
                    "id": "color_5",
                    "value": "rgba(0, 0, 0, 0.49)",
                    "label": "Color #5"
                },
                {
                    "id": "color_6",
                    "value": null,
                    "label": null
                },
                {
                    "id": "color_7",
                    "value": null,
                    "label": null
                },
                {
                    "id": "color_8",
                    "value": null,
                    "label": null
                }
            ]
        };

        const themeResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${data.site_name}/theme`, {
            method: 'PUT',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(themeData)
        });

        if (!themeResponse.ok) {
            throw new Error('Failed to update theme');
        }

        // Update content
        const contentData = {
            "location_data": {
                "address": {
                    "country": settings.country,
                    "city": settings.city,
                    "region": settings.region,
                    "streetAddress": settings.street,
                    "postalCode": settings.postcode
                },
                "phones": [
                    {
                        "label": "Reception",
                        "phoneNumber": settings.phoneNumber
                    }
                ],
                "emails": [
                    {
                        "emailAddress": settings.emailAddress,
                        "label": "enquiry email address"
                    }
                ]
            },
            "site_texts": {
                "about_us": "",
                "custom": [
                    {
                        "label": "Privacy Policy",
                        "text": ""
                    },
                    {
                        "label": "Terms and Conditions",
                        "text": ""
                    },
                    {
                        "label": "Channel Code",
                        "text": settings.channelCode
                    },
                    {
                        "label": "Domain",
                        "text": settings.domain
                    },
                    {
                        "label": "longitude",
                        "text": settings.longitude
                    },
                    {
                        "label": "latitude",
                        "text": settings.latititude
                    }
                ]
            },
            "site_images": [
                {
                    "label": "HeaderImage",
                    "url": settings.headerImageURL,
                    "alt": "Property Banner"
                }
            ],
            "business_data": {
                "name": settings.propertyName
            }
        };

        const contentResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${data.site_name}/content`, {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contentData)
        });

        if (!contentResponse.ok) {
            throw new Error('Failed to update content');
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create site' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});