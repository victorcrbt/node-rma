'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn('clients', 'document', {
        type: Sequelize.STRING,
        allowNull: false,
       }, {
         after: 'company_name'
       });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('clients', 'document');
  }
};
