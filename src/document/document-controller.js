const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate');
const authorize = require('../middleware/basic-auth')
const documentService = require('./document-service');

// routes
router.post('/documents', authorize, documentValidation, upload);
router.get('/documents/:doc_id', authorize, getDocumentById);
router.delete('/documents/:doc_id', authorize, deleteDocument);

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

function getDocumentById(req, res, next) {
    documentService.getById(req, req.params.doc_id)
        .then(user => res.json(user))
        .catch(next);
}

function deleteDocument(req, res, next) {
    documentService.deleteDoc(req.params.doc_id, req)
        .then(user => res.status(204).json(user))
        .catch(next);
}
