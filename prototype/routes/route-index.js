const express = require('express');
const router = express.Router();

// Import route handlers
const siteChecker = require('./route-site-checker');
const templateList = require('./route-template-list');
const siteCreator = require('./route-site-creator');
const accountManager = require('./route-account-manager');

// Mount routes
router.use('/account', accountManager);
router.use('/site', siteChecker);
router.use('/templates', templateList);
router.use('/create-site', siteCreator);

module.exports = router;