const bcrypt = require('bcryptjs');
const db = require('../utils/database');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const env = process.env;

const bucketName = env.S3_BUCKET_NAME;

module.exports = {
    upload,
    getById,
    deleteDoc,
    getAllDocs
};

const s3 = (env.NODE_ENV == "development") ? 
    new AWS.S3({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
    :
    new AWS.S3()

async function upload(params) {
    let myFile = params.files.myFile.name.split(".");
    const fileType = myFile[myFile.length - 1];

    const fileContent = Buffer.from(params.files.myFile.data, 'binary');
    const key = `${uuid()}`;
    const s3params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent
    }
    const path = "https://"+process.env.AWS_BUCKET_NAME+".s3.amazonaws.com/"+key;
    console.log(path);
    s3.upload(s3params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(data);
    });

    var presignedGETURL = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: key,
        Expires: 1000*5 
    });
    const meta = {
        doc_id: key,
        user_id: params.user.dataValues.id,
        name: params.files.myFile.name,
        s3_bucket_path: path
    }
    const document =  await db.Document.create(meta);
    return omitValues(document.get());
}

async function getAllDocs(req) {
    const documents = await db.Document.findAll();
    if (!documents) throw 'Document not available!!!';
    return documents;
}

async function getById(req, doc_id) {
    return await getDocById(req, doc_id);
}

async function getDocById(req, doc_id) {
    const document = await db.Document.findOne({ where: { doc_id: doc_id } })
    if (!document) throw 'Document not available!!!';

    if(document.dataValues.user_id != req.user.dataValues.id){
        throw 'This Document is not accessible to you!!!'
    }
    return document;
}

async function deleteDoc(doc_id, req){
    const document = await db.Document.findOne({ where: { doc_id: doc_id } })
    if (!document) throw 'Document not available!!!';

    if(document.dataValues.user_id != req.user.dataValues.id){
        throw 'You cannot delete this document!!!'
    }

    db.Document.destroy({ where: { doc_id: doc_id } })
    const params = {
        Bucket: bucketName,
        Key: document.dataValues.doc_id
      };
    s3.deleteObject(params, function (err, data) {
        if (err) {
            throw err;
        }
  })

}

function omitValues(document) {
    const { id, updatedAt, ...documentWithoutId } = document;
    return documentWithoutId;
}