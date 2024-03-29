const config = require('../../db-config');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, user, password, database, port } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
        host: config.database.host,
        dialect: "mysql",
        operatorsAliases: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });


    db.User = require('../user/user-model')(sequelize);
    db.Document = require('../document/document-model')(sequelize);

    db.Document.belongsTo(db.User,{as:'Users',foreignKey:'user_id',targetKey:'id'});
    db.User.hasMany(db.Document, {foreignKey:'user_id'});
    
    await sequelize.sync();
}