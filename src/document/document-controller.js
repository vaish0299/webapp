const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate');
const authorize = require('../middleware/basic-auth')
const documentService = require('./document-service');
const statsdClient= require("../utils/statsdUtil");
// routes
router.post('/documents', authorize, documentValidation, upload);
router.get('/documents', authorize, getAllDocuments);
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
    statsdClient.increment('post_/self');
    documentService.upload(req)
        .then(data => res.status(201).json(data))
        .catch(next);
}

function getAllDocuments(req, res, next) {
    statsdClient.increment('get_/self');
    documentService.getAllDocs(req)
        .then(data => res.status(200).json(data))
        .catch(next);
}

function getDocumentById(req, res, next) {
    statsdClient.increment('get_/self');
    documentService.getById(req, req.params.doc_id)
        .then(user => res.json(user))
        .catch(next);
}

function deleteDocument(req, res, next) {
    statsdClient.increment('delete_/self');
    documentService.deleteDoc(req.params.doc_id, req)
        .then(user => res.status(204).json(user))
        .catch(next);
}
