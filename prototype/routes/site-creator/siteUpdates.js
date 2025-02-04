const fetch = require('node-fetch');
const { authHeader } = require('../../config/config-loader');
const { hexToRgb, delay } = require('../../utils/helpers');

async function updateTheme(siteName, settings) {
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

    console.log('Updating theme with data:', themeData);
    const themeResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/theme`, {
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

    await delay(500);
}

async function updateContent(siteName, settings) {
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

    console.log('Updating content with data:', contentData);
    const contentResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/content`, {
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

    await delay(500);
}

async function updateCollections(siteName, settings) {
    // Update room collection
    const roomCollectionData = {
        "external_details": {
            "enabled": true,
            "external_endpoint": `https://samuelgfenton.github.io/dudaTest/${settings.spid}/{lang}/roomsCollection.json`,
            "page_item_url_field": "RoomId",
            "custom_headers": []
        }
    };

    console.log('Updating room collection with data:', roomCollectionData);
    const roomCollectionResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/collection/roomCollection`, {
        method: 'PUT',
        headers: {
            ...authHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomCollectionData)
    });

    if (!roomCollectionResponse.ok) {
        throw new Error('Failed to update room collection');
    }

    await delay(500);

    // Update property collection
    const propertyCollectionData = {
        "external_details": {
            "enabled": true,
            "external_endpoint": `https://samuelgfenton.github.io/dudaTest/${settings.spid}/{lang}/propertyCollection.json`,
            "page_item_url_field": "Item",
            "custom_headers": []
        }
    };

    console.log('Updating property collection with data:', propertyCollectionData);
    const propertyCollectionResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${siteName}/collection/propertyCollection`, {
        method: 'PUT',
        headers: {
            ...authHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyCollectionData)
    });

    if (!propertyCollectionResponse.ok) {
        throw new Error('Failed to update property collection');
    }

    await delay(500);
}

async function updateLanguages(siteName, settings) {
    try {
        // First set the default language
        console.log('Setting default language:', settings.defaultLanguage);
        const defaultLanguageResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/update/${siteName}`, {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "lang": settings.defaultLanguage
            })
        });

        const defaultLangResponseText = await defaultLanguageResponse.text();
        console.log('Default language update response status:', defaultLanguageResponse.status);
        console.log('Default language update response:', defaultLangResponseText);

        if (!defaultLanguageResponse.ok) {
            throw new Error(`Failed to update default language. Status: ${defaultLanguageResponse.status}. Response: ${defaultLangResponseText}`);
        }

        await delay(500);

        // Then update additional languages
        const additionalLanguages = typeof settings.additionalLanguages === 'string' 
            ? JSON.parse(settings.additionalLanguages)
            : settings.additionalLanguages;

        console.log('Parsed additional languages:', additionalLanguages);

        const languagesData = {
            "additionalLanguages": additionalLanguages
        };

        console.log('Updating languages for site:', siteName);
        console.log('Languages update data:', languagesData);

        const languagesResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/update/${siteName}`, {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(languagesData)
        });

        const responseText = await languagesResponse.text();
        console.log('Languages update response status:', languagesResponse.status);
        console.log('Languages update response body:', responseText);

        if (!languagesResponse.ok) {
            throw new Error(`Failed to update additional languages. Status: ${languagesResponse.status}. Response: ${responseText}`);
        }

        return languagesResponse.status === 204 || !responseText.trim() 
            ? null 
            : JSON.parse(responseText);
    } catch (error) {
        console.error('Language update error details:', {
            error: error.message,
            siteName: siteName,
            defaultLanguage: settings.defaultLanguage,
            additionalLanguages: settings.additionalLanguages
        });
        throw new Error(`Failed to update languages: ${error.message}`);
    }
}

module.exports = {
    updateTheme,
    updateContent,
    updateCollections,
    updateLanguages
};