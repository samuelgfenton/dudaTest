const express = require('express');
const router = express.Router();

// Import route handlers
const siteChecker = require('./route-site-checker');
const templateList = require('./route-template-list');
const accountManager = require('./route-account-manager');
const propertyManager = require('./route-property-manager');
const siteCreator = require('./site-creator/handlers');  // Updated import

// Mount routes
router.use('/account', accountManager);
router.use('/site', siteChecker);
router.use('/templates', templateList);
router.use('/create-site', siteCreator);  // This now uses the new split files
router.use('/properties', propertyManager);

module.exports = router;