const bcrypt = require('bcryptjs');
const db = require('../utils/database');

module.exports = {
    authenticate,
    getById,
    create,
    update,
};

async function authenticate({ username, password, id}) {

    const user = await db.User.scope('withPassword').findByPk(id);
    let usernameValidation = false;
    if(username === user.dataValues.username){
        usernameValidation = true;
    }
    const compare = await comparePassword(password, user.dataValues.password);
    if (user && compare && usernameValidation) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
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

    await db.User.create(params);
}

async function update(accountId, params) {
    const user = await getUser(accountId);

    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }

    Object.assign(user, params);
    await user.save();

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