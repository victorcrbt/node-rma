module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('warranty_types', [
      {
        description: 'Normal',
        created_at: 'NOW()',
        updated_at: 'NOW()',
      },
      {
        description: 'Zero Hora',
        created_at: 'NOW()',
        updated_at: 'NOW()',
      },
    ]);
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('warranty_types');
  },
};
