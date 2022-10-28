const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate');
const authorize = require('../middleware/basic-auth')
const documentService = require('./document-service');

// routes
router.post('/documents', authorize, documentValidation, upload);
// router.get('/account/:accountId', authorize, getById);
// router.put('/account/:accountId', authorize, updateAccount, update);

module.exports = router;

function documentValidation(req, res, next) {
    if(!req.files){
        res.status(400).send({
            message: 'No file uploaded'
        });
    }
    next();
}

function upload(req, res, next) {
    documentService.upload(req, res)
        .then(data => res.status(201).json(data))
        .catch(next);
}

function getById(req, res, next) {
    userService.getById(req.params.accountId)
        .then(user => res.json(user))
        .catch(next);
}

function updateAccount(req, res, next) {
    const schema = Joi.object({
        first_name: Joi.string().empty(''),
        last_name: Joi.string().empty(''),
        username: Joi.string().empty(''),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.accountId, req.body)
        .then(user => res.status(204).json(user))
        .catch(next);
}
