// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');
// const { authHeader, getPropertySettings } = require('../config/config-loader');
// const { hexToRgb, delay } = require('../utils/helpers');

// router.post('/', async (req, res) => {
//     try {
//         const { templateId } = req.body;
//         const settings = getPropertySettings(req.session.currentSpid);
//         console.log('Creating site with template:', templateId, 'for property:', settings.propertyName);
        
//         const createSiteData = {
//             "site_data": {
//                 "external_uid": settings.spid,
//                 "site_business_info": {
//                     "business_name": settings.propertyName
//                 }
//             },
//             "template_id": templateId,
//             "default_domain_prefix": settings.channelCode,
//             "lang": settings.defaultLanguage
//         };

//         console.log('Create site request data:', createSiteData);

//         const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/create', {
//             method: 'POST',
//             headers: {
//                 ...authHeader,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(createSiteData)
//         });

//         const responseText = await response.text();
//         console.log('Create site response status:', response.status);
//         console.log('Create site response body:', responseText);

//         if (!response.ok) {
//             throw new Error(`Failed to create site. Status: ${response.status}. Response: ${responseText}`);
//         }

//         let data;
//         try {
//             data = responseText ? JSON.parse(responseText) : {};
//         } catch (e) {
//             console.error('Error parsing response:', e);
//             throw new Error('Invalid response format from server');
//         }

//         await delay(500);

//         // Update the theme
//         const themeData = {
//             "colors": [
//                 {
//                     "id": "color_1",
//                     "value": "rgba(247,247,247,1)",
//                     "label": "Primary"
//                 },
//                 {
//                     "id": "color_2",
//                     "value": "rgba(70,57,57,1)",
//                     "label": "Secondary"
//                 },
//                 {
//                     "id": "color_3",
//                     "value": `rgba(${hexToRgb(settings.colorHex)},1)`,
//                     "label": "Color #3"
//                 },
//                 {
//                     "id": "color_4",
//                     "value": "rgba(226, 226, 226, 1)",
//                     "label": "Color #4"
//                 },
//                 {
//                     "id": "color_5",
//                     "value": "rgba(0, 0, 0, 0.49)",
//                     "label": "Color #5"
//                 },
//                 {
//                     "id": "color_6",
//                     "value": "rgba(255,255,255,1)",
//                     "label": "Color #6"
//                 },
//                 {
//                     "id": "color_7",
//                     "value": "rgba(255,255,255,1)",
//                     "label": "Color #7"
//                 },
//                 {
//                     "id": "color_8",
//                     "value": "rgba(255,255,255,1)",
//                     "label": "Color #8"
//                 }
//             ]
//         };

//         console.log('Updating theme with data:', themeData);
//         const themeResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${data.site_name}/theme`, {
//             method: 'PUT',
//             headers: {
//                 ...authHeader,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(themeData)
//         });

//         const themeResponseText = await themeResponse.text();
//         console.log('Theme update response status:', themeResponse.status);
//         console.log('Theme update response:', themeResponseText);

//         if (!themeResponse.ok) {
//             throw new Error(`Failed to update theme. Status: ${themeResponse.status}. Response: ${themeResponseText}`);
//         }

//         await delay(500);

//         // Update content
//         const contentData = {
//             "location_data": {
//                 "address": {
//                     "country": settings.country,
//                     "city": settings.city,
//                     "region": settings.region,
//                     "streetAddress": settings.street,
//                     "postalCode": settings.postcode
//                 },
//                 "phones": [
//                     {
//                         "label": "Reception",
//                         "phoneNumber": settings.phoneNumber
//                     }
//                 ],
//                 "emails": [
//                     {
//                         "emailAddress": settings.emailAddress,
//                         "label": "enquiry email address"
//                     }
//                 ]
//             },
//             "site_texts": {
//                 "about_us": "",
//                 "custom": [
//                     {
//                         "label": "Privacy Policy",
//                         "text": ""
//                     },
//                     {
//                         "label": "Terms and Conditions",
//                         "text": ""
//                     },
//                     {
//                         "label": "Channel Code",
//                         "text": settings.channelCode
//                     },
//                     {
//                         "label": "Domain",
//                         "text": settings.domain
//                     },
//                     {
//                         "label": "longitude",
//                         "text": settings.longitude
//                     },
//                     {
//                         "label": "latitude",
//                         "text": settings.latititude
//                     }
//                 ]
//             },
//             "site_images": [
//                 {
//                     "label": "HeaderImage",
//                     "url": settings.headerImageURL,
//                     "alt": "Property Banner"
//                 }
//             ],
//             "business_data": {
//                 "name": settings.propertyName
//             }
//         };

//         console.log('Updating content with data:', contentData);
//         const contentResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${data.site_name}/content`, {
//             method: 'POST',
//             headers: {
//                 ...authHeader,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(contentData)
//         });

//         const contentResponseText = await contentResponse.text();
//         console.log('Content update response status:', contentResponse.status);
//         console.log('Content update response:', contentResponseText);

//         if (!contentResponse.ok) {
//             throw new Error(`Failed to update content. Status: ${contentResponse.status}. Response: ${contentResponseText}`);
//         }

//         await delay(500);

//         // Update room collection
//         const roomCollectionData = {
//             "external_details": {
//                 "enabled": true,
//                 "external_endpoint": `https://samuelgfenton.github.io/dudaTest/${settings.spid}/{lang}/roomsCollection.json`,
//                 "page_item_url_field": "RoomId",
//                 "custom_headers": []
//             }
//         };

//         console.log('Updating room collection with data:', roomCollectionData);
//         const roomCollectionResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${data.site_name}/collection/roomCollection`, {
//             method: 'PUT',
//             headers: {
//                 ...authHeader,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(roomCollectionData)
//         });

//         const roomCollectionResponseText = await roomCollectionResponse.text();
//         console.log('Room collection update response status:', roomCollectionResponse.status);
//         console.log('Room collection update response:', roomCollectionResponseText);

//         if (!roomCollectionResponse.ok) {
//             throw new Error(`Failed to update room collection. Status: ${roomCollectionResponse.status}. Response: ${roomCollectionResponseText}`);
//         }

//         await delay(500);

//         // Update property collection
//         const propertyCollectionData = {
//             "external_details": {
//                 "enabled": true,
//                 "external_endpoint": `https://samuelgfenton.github.io/dudaTest/${settings.spid}/{lang}/propertyCollection.json`,
//                 "page_item_url_field": "Item",
//                 "custom_headers": []
//             }
//         };

//         console.log('Updating property collection with data:', propertyCollectionData);
//         const propertyCollectionResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/${data.site_name}/collection/propertyCollection`, {
//             method: 'PUT',
//             headers: {
//                 ...authHeader,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(propertyCollectionData)
//         });

//         const propertyCollectionResponseText = await propertyCollectionResponse.text();
//         console.log('Property collection update response status:', propertyCollectionResponse.status);
//         console.log('Property collection update response:', propertyCollectionResponseText);

//         if (!propertyCollectionResponse.ok) {
//             throw new Error(`Failed to update property collection. Status: ${propertyCollectionResponse.status}. Response: ${propertyCollectionResponseText}`);
//         }

//         await delay(500);

//         // Update languages
//         const additionalLanguages = JSON.parse(settings.additionalLanguages);
//         const languagesData = {
//             "additionalLanguages": additionalLanguages
//         };

//         console.log('Updating languages with data:', languagesData);
//         const languagesResponse = await fetch(`https://api-sandbox.duda.co/api/sites/multiscreen/update/${data.site_name}`, {
//             method: 'POST',
//             headers: {
//                 ...authHeader,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(languagesData)
//         });

//         const languagesResponseText = await languagesResponse.text();
//         console.log('Languages update response status:', languagesResponse.status);
//         console.log('Languages update response:', languagesResponseText);

//         if (!languagesResponse.ok) {
//             throw new Error(`Failed to update languages. Status: ${languagesResponse.status}. Response: ${languagesResponseText}`);
//         }

//         res.json({
//             success: true,
//             data: data
//         });
//     } catch (error) {
//         console.error('Detailed create error:', error);
//         res.status(500).json({ 
//             success: false,
//             error: error.message || 'Failed to create site' 
//         });
//     }
// });

// module.exports = router;