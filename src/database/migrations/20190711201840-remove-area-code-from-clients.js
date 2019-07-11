module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('clients', 'area_code');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('clients', 'area_code', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
