module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('clients', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      salesman_id: {
        type: Sequelize.INTEGER,
        references: { model: 'salesmen', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      neighborhood: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      zip_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      area_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('clients');
  },
};
