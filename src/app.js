require('rootpath')();
const fileUpload = require('express-fileupload');
const express = require('express');
require('dotenv').config();
const env = process.env;

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/error-handler');

app.use(fileUpload({
    createParentPath: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/healthz", (req, res) => {
    res.status(200).send({"statusCode":200, "message":"healthCheck successful!!!"});
});

app.get("/checkpoint", (req, res) => {
    res.status(200).send({"statusCode":200, "message":"healthCheck successful!!!"});
});

app.use('/v1', require('./user/user-controller'));
app.use('/v1', require('./document/document-controller'));

app.use(errorHandler);

module.exports = app;