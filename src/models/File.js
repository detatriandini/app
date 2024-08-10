'use strict';
import {Model} from 'sequelize';
import crypto from 'crypto';

export default (sequelize, DataTypes) => {

  class File extends Model {};

  File.init({
    type: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    filePath: {
        type: DataTypes.STRING,
    },
    fileOriginal: {
      type: DataTypes.STRING,
    },
    fileEncrypted: {
      type: DataTypes.STRING,
    },
    fileType: {
        type: DataTypes.STRING,
    },
    fileSize: {
      type: DataTypes.INTEGER,
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: ''} 
      }
    },
    passwordKey: {
      type: DataTypes.STRING,
    },
    encryptionKey: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.STRING,
    },
    encryptionType: {
      type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: 'users', // <<< Note, its table's name, not object name
        referencesKey: 'id', // <<< Note, its a column name
    }
  }, {
    sequelize,
    modelName: 'File',
  });

  File.associate = (models) => {
    File.belongsTo(models.User, {foreignKey: "userId"})
  }

  File.beforeCreate(async (file, options)  => {
    const saltHash = await crypto.randomBytes(32).toString();
    const hashPassword = await crypto.pbkdf2Sync(file.password, saltHash, 10000, 64, 'sha512').toString('hex');
    file.password = hashPassword;
    file.passwordKey = saltHash;
  });

  File.comparePassword = async (password, file) => {
    const hashVerify = await crypto.pbkdf2Sync(password, file.passwordKey, 10000, 64, 'sha512').toString('hex');
    return file.password === hashVerify;
  }

  return File;
};