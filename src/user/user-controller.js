const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate');
const authorize = require('../middleware/basic-auth')
const userService = require('./user-service');
const statsdClient = require('../utils/statsdUtil.js');
// routes
router.post('/account', registerAccount, register);
router.get('/account/:accountId', authorize, getById);
router.put('/account/:accountId', authorize, updateAccount, update);

module.exports = router;
//To validate our req.body 
function registerAccount(req, res, next) {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    console.log(statsdClient);
    statsdClient.increment('post_/account');
    userService.create(req.body)
        .then(user => res.status(201).json(user))
        .catch(next);
}

function getById(req, res, next) {
    statsdClient.increment('get_/account');
    userService.getById(req.params.accountId, req)
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
    statsdClient.increment('put_/account');
    userService.update(req.params.accountId, req.body)
        .then(user => res.status(204).json(user))
        .catch(next);
}
