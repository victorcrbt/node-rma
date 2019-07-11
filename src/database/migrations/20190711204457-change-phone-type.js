module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('clients', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('clients', 'phone', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
