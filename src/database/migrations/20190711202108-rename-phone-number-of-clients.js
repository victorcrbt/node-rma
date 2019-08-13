'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.renameColumn('clients', 'phone_number', 'phone');

  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('clients', 'phone', 'phone_number');
  }
};
