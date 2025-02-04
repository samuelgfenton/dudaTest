const express = require('express');
const router = express.Router();
const { createSite } = require('./createSite');
const { resetTemplate } = require('./resetTemplate');

router.post('/', createSite);
router.post('/reset-template', resetTemplate);

module.exports = router;