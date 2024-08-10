'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      description: {
        type: Sequelize.TEXT,
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_original: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_encrypted: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
      },
      password_key: {
        type: Sequelize.STRING,
      },
      encryption_key: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.STRING,
      },
      encryption_type: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Files');
  }
};