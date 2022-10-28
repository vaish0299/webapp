const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        doc_id:{ type: DataTypes.STRING, allowNull: false },
        user_id:{ type: DataTypes.INTEGER, allowNull: false },
        name:{ type: DataTypes.STRING, allowNull: false },
        s3_bucket_path: { type: DataTypes.STRING, allowNull: false },
    };

    const options = {
        defaultScope: {
            attributes: { exclude: ['id', 'updatedAt'] }
            
        },
        scopes: {
            withPassword: { attributes: {}, }
        }
    };

    return sequelize.define('Document', attributes, options);
}