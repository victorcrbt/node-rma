module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('registers', 'salesman_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('registers', 'salesman_id', {
      type: Sequelize.INTEGER,
      references: { model: 'salesmen', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },
};
