module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('clients', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: false,
      primaryKey: true,
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('clients', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    });
  },
};
