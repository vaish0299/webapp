const config = require('../../db-config');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, user, password, database, port } = config.db;
    console.log("DB Hostname is" + host);
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    let sequelize;
    if(process.env.NODE_ENV === 'test') {
         sequelize = new Sequelize(database, user, password, { dialect: 'sqlite', "storage":":memory:", logging:false });
    }else{
        sequelize = new Sequelize(database, user, password, { dialect: 'mysql', logging:false });
    }


    db.User = require('../user/user-model')(sequelize);
    
    await sequelize.sync();
}