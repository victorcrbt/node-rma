module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('registers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      client_id: {
        type: Sequelize.INTEGER,
        references: { model: 'clients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      salesman_id: {
        type: Sequelize.INTEGER,
        references: { model: 'salesmen', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      warranty_type_id: {
        type: Sequelize.INTEGER,
        references: { model: 'warranty_types', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      status_id: {
        type: Sequelize.INTEGER,
        references: { model: 'status', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      brand_id: {
        type: Sequelize.INTEGER,
        references: { model: 'brands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      entry_invoice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      entry_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      delivery_cost: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      repair_cost: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      exchange_value: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      exchange_mail: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_status_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      register_observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      serial_number: {
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
    return queryInterface.dropTable('registers');
  },
};
