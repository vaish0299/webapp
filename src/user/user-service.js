const bcrypt = require('bcryptjs');
const db = require('../utils/database');
const logger=require('../log/logger');
module.exports = {
    authenticate,
    getById,
    create,
    update,
};

async function authenticate({ username, password}) {
    logger.info("authenticating the user");
    const user = await db.User.scope('withPassword').findOne({ where: { username: username } })
    let usernameValidation = false;
    if(user){
        if(username === user.dataValues.username){
            usernameValidation = true;
        }
        const compare = await comparePassword(password, user.dataValues.password);
        if (user && compare && usernameValidation) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword; //returning the user object without password
        }
    }
}

async function comparePassword(password, hash) {
    const result =  await bcrypt.compare(password, hash);
    return result;
}

async function getById(accountId, req) {
    return await getUser(accountId, req);
}

async function create(params) {
    logger.info("looking if user with that user name already exists");
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already registered, Please pick a different Username!!';
    }

    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }
    //creating a record in the database using the create library (sequalize)
    logger.info("reating a record in the database using the create library (sequalize)");
    const user = await db.User.create(params);
    return omitPassword(user.get());
}

async function update(accountId, params) {
    //we get this user object from the db
    logger.info("getting this user object from the db");
    const user = await getUser(accountId);
    logger.info("getting the user from db");
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
    logger.info("saving the user to db");
    //To omit password in the response 
    return omitPassword(user.get());
}

async function getUser(accountId, req) {
    const user = await db.User.findByPk(accountId);
    logger.info("finding the user using id in the db");
    if (!user) throw 'User is not present!!!';

    if(user.dataValues.id != req.user.dataValues.id){
        throw 'Unauthorized'
    }
    logger.info("user is present");
    return user;
}

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}