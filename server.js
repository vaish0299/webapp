require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./src/middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/healthz", (req, res) => {
    res.status(200).send({"statusCode":200, "message":"healthCheck successful!!!"});
});

app.use('/v1', require('./src/user/user-controller'));

app.use(errorHandler);

const port = process.env.NODE_ENV === 'ci' ? (process.env.PORT || 80) : 8000;
app.listen(port, () => console.log('Srver Started on ' + port));