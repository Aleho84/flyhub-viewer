const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

router.get('/images', imageController.getImages);

module.exports = router;
