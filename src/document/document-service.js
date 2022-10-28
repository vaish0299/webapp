const bcrypt = require('bcryptjs');
const db = require('../utils/database');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

module.exports = {
    update,
    upload
};

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

async function upload(params, res) {
    console.log(params.user.dataValues.id)
    let myFile = params.files.myFile.name.split(".");
    const fileType = myFile[myFile.length - 1];
    console.log(fileType)

    const fileContent = Buffer.from(params.files.myFile.data, 'binary');
    console.log(process.env.AWS_BUCKET_NAME)
    const key = `${uuid()}.${fileType}`;
    const s3params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fileContent
    }
    s3.upload(s3params, function(err, data) {
        if (err) {
            throw err;
        }
    });

    var presignedGETURL = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Expires: 1000*5 //time to expire in seconds
    });
    const meta = {
        doc_id: key,
        user_id: params.user.dataValues.id,
        name: params.files.myFile.name,
        s3_bucket_path: presignedGETURL
    }
    const document =  await db.Document.create(meta);
    return omitValues(document.get());
}

async function update(accountId, params) {
    //we get this user object from the db
    const user = await getUser(accountId);
    //if changing the password this is to encrypt the new password
    if(user){
        if(params.username !== user.dataValues.username) {
            throw 'Forbidden to change user name';
        }
    }else {
        throw 'not found';
    }
 

    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }

    Object.assign(user, params);
    //saving the user object to the db
    await user.save();
    //To omit password in the response 
    return omitPassword(user.get());
}

async function getUser(accountId) {
    const user = await db.User.findByPk(accountId);
    if (!user) throw 'User is not present!!!';
    return user;
}

function omitValues(document) {
    const { id, updatedAt, ...documentWithoutId } = document;
    return documentWithoutId;
}