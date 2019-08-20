module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'reset_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });

      await queryInterface.addColumn('users', 'token_expiration', {
        type: Sequelize.DATE,
        allowNull: true,
      });

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },

  down: async queryInterface => {
    try {
      await queryInterface.removeColumn('users', 'reset_token');
      await queryInterface.removeColumn('users', 'token_expiration');

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
