const uploadController = require('../controllers/upload.controller');

const express = require('express');
const route = express.Router();
 
route.post("/image-upload",uploadController.uploadFile);

module.exports = route;

