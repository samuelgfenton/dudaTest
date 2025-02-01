const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authHeader, settings } = require('../config/config-loader');
const { hexToRgb, delay } = require('../utils/helpers');

// Helper function for API calls with proper logging
async function makeApiCall(url, options, operationName) {
    console.log(`Making ${operationName} API call to:`, url);
    console.log(`${operationName} request body:`, options.body);
    
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    console.log(`${operationName} response status:`, response.status);
    console.log(`${operationName} response body:`, responseText);

    if (!response.ok) {
        throw new Error(`${operationName} failed. Status: ${response.status}. Response: ${responseText}`);
    }

    return responseText.length > 0 ? JSON.parse(responseText) : null;
}

router.post('/reset-template', async (req, res) => {
    try {
        const { siteName, templateId } = req.body;
        console.log('Starting template reset process for site:', siteName, 'template:', templateId);
        
        // 1. Reset to new template
        const resetData = {
            "site_data": {
                "removeBizInfos": true
            },
            "template_id": templateId
        };

        await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/reset/${siteName}`,
            {
                method: 'POST',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resetData)
            },
            'Reset Template'
        );

        await delay(500);

        // 2. Update the theme
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
                    "value": "rgba(255,255,255,1)",
                    "label": "Color #6"
                },
                {
                    "id": "color_7",
                    "value": "rgba(255,255,255,1)",
                    "label": "Color #7"
                },
                {
                    "id": "color_8",
                    "value": "rgba(255,255,255,1)",
                    "label": "Color #8"
                }
            ]
        };

        await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/theme`,
            {
                method: 'PUT',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(themeData)
            },
            'Update Theme'
        );

        await delay(500);

        // 3. Update content
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

        await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/content`,
            {
                method: 'POST',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contentData)
            },
            'Update Content'
        );

        await delay(500);

        // 4. Update room collection
        const roomCollectionData = {
            "external_details": {
                "enabled": true,
                "external_endpoint": `https://samuelgfenton.github.io/dudaTest/${settings.spid}/{lang}/roomsCollection.json`,
                "page_item_url_field": "RoomId",
                "custom_headers": []
            }
        };

        await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/collection/roomCollection`,
            {
                method: 'PUT',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(roomCollectionData)
            },
            'Update Room Collection'
        );

        await delay(500);

        // 5. Update property collection
        const propertyCollectionData = {
            "external_details": {
                "enabled": true,
                "external_endpoint": `https://samuelgfenton.github.io/dudaTest/${settings.spid}/{lang}/propertyCollection.json`,
                "page_item_url_field": "Item",
                "custom_headers": []
            }
        };

        await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/collection/propertyCollection`,
            {
                method: 'PUT',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyCollectionData)
            },
            'Update Property Collection'
        );

        await delay(500);

        // 6. Update languages
        const additionalLanguages = JSON.parse(settings.additionalLanguages);
        const languagesData = {
            "additionalLanguages": additionalLanguages
        };

        await makeApiCall(
            `https://api-sandbox.duda.co/api/sites/multiscreen/update/${siteName}`,
            {
                method: 'POST',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(languagesData)
            },
            'Update Languages'
        );

        res.json({
            success: true
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to reset template' 
        });
    }
});

module.exports = router;