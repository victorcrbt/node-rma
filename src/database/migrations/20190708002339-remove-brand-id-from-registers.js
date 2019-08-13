module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('registers', 'brand_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('registers', 'brand_id', {
      type: Sequelize.INTEGER,
      references: { model: 'brands', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },
};
