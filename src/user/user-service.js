const bcrypt = require('bcryptjs');
const db = require('../utils/database');

module.exports = {
    authenticate,
    getById,
    create,
    update,
};

async function authenticate({ username, password}) {
    const user = await db.User.scope('withPassword').findOne({ where: { username: username } })
    // const user = await db.User.scope('withPassword').findByPk(id);
    //console.log(user)
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

async function getById(accountId) {
    return await getUser(accountId);
}

async function create(params) {
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already registered, Please pick a different Username!!';
    }

    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }
    //creating a record in the database using the create library (sequalize)
    const user = await db.User.create(params);
    return omitPassword(user.get());
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

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}