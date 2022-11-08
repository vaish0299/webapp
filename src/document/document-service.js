const bcrypt = require('bcryptjs');
const db = require('../utils/database');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
//const logger = require('../log/logger');
const env = process.env;
//const logger=require("../log/logger")
const bucketName = env.S3_BUCKET_NAME;

module.exports = {
    upload,
    getById,
    deleteDoc,
    getAllDocs
};
// global.logger=logger;
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
    const path = "https://"+bucketName+".s3.amazonaws.com/"+key;
    // logger.info("uploaded file at"+path);
    console.log(path);
    s3.upload(s3params, function(err, data) {
        if (err) {
            throw err;
            // logger.fatal("upload error");
            // logger.fatal(err)
        }
        console.log(data);
        //logger.info('File uploaded Successfully',data);
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
    // logger.info("Inside the getall files");
    const documents = await db.Document.findAll();
    // logger.info(documents.dataValues.doc_id);
    // logger.info(documents.dataValues.user_id);
    // logger.info(documents.dataValues.name);
    // logger.info(documents.dataValues.s3_bucket_path);
    if (!documents) throw 'Document not available!!!';
    return documents;
}

async function getById(req, doc_id) {
    return await getDocById(req, doc_id);
}

async function getDocById(req, doc_id) {
    //logger.info("Inside the get files by doc_id");
    const document = await db.Document.findOne({ where: { doc_id: doc_id } })
    //logger.info("doc_id information"+document.dataValues.doc_id);
    if (!document) throw 'Document not available!!!';

    if(document.dataValues.user_id != req.user.dataValues.id){
        throw 'This Document is not accessible to you!!!'
    }
    //logger.info("got the file with specific doc_id")
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
    //logger.info("deleting doc with doc_id"+document.dataValues.doc_id);
    s3.deleteObject(params, function (err, data) {
        if (err) {
            throw err;
        }
  })
    //logger.info("deleted doc in the db");

}

function omitValues(document) {
    const { id, updatedAt, ...documentWithoutId } = document;
    return documentWithoutId;
}