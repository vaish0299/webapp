const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate');
const authorize = require('../middleware/basic-auth')
const userService = require('./user-service');
const statsdClient = require('../utils/statsdUtil.js');
const uuid = require('uuid');
const DynamoDBUtil =require('../dynamo/dbUtil.js');
const SNSUtil = require('../sns/snsUtil.js');
const fs = require('fs');
const path = require("path");
let rawdata = fs.readFileSync(path.resolve(__dirname, "../../mysql.config"));
let config = JSON.parse(rawdata);
// routes
router.post('/account', registerAccount, register);
router.get('/account/:accountId', authorize, getById);
router.put('/account/:accountId', authorize, updateAccount, update);

router.post('/',registerAccount,register);
router.get('/verify',verifyUser);

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
        .then(async data => {await generateNSendVerificationLink(data); return data;})
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

const  generateNSendVerificationLink =async function (user){
    const token =   (uuid.v4());
    
    let data =  await DynamoDBUtil.getEntry(user.username,"EMAIL_SENT");
    //(data && Object.keys(data).length !== 0)
    if( !data || Object.keys(data).length === 0){
        await DynamoDBUtil.addEntry(user.username,token);
        
        const email=user.username,userName=user.first_name;
        let verifyLink = `https://${config.domain}/v1/user/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
        try{
          await SNSUtil.sendEmail({toEmail:email,userName:userName,verifyLink:verifyLink});
          await DynamoDBUtil.addEntry(user.username,"EMAIL_SENT");
          console.log("after entry");
      }
      catch(e){
        console.log(e);
  
        console.log("error while sending mail");
        console.log({toEmail:email,userName:userName,verifyLink:verifyLink});
      }
    }
  }
  
    async function verifyUser(req,res,next){
    statsdClient.increment('get_/verify');
    console.log(req.query);
    const email= req.query.email;
    const token= req.query.token;
    let data =  await DynamoDBUtil.getEntry(email,token);
      
    if( data && Object.keys(data).length !== 0){
      console.log(data);
      
      const secondsSinceEpoch = Math.round(Date.now() / 1000);
      console.log("secondsSinceEpoch")
      console.log(secondsSinceEpoch)
      console.log(parseInt(secondsSinceEpoch));
      console.log("data.ttl")
      console.log(data.Item.ttl)
      console.log(parseInt(data.Item.ttl))
      if(parseInt(data.Item.ttl)>parseInt(secondsSinceEpoch)){
        await userService.markUserVerified({username:req.query.email});
        res.status(200);
        res.json('Account Verified');
        console.log("marked user as verified");
      }
      else{
        console.log("secondsSinceEpoch")
        console.log(secondsSinceEpoch)
        console.log("data.ttl")
        console.log(data.Item.ttl)
        res.status(400);
        res.json('URL Expired');
      }
    }
    else{
      console.log("entry not present");
      res.sendStatus(400);
    }
  }
