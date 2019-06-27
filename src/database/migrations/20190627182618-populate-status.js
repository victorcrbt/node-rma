'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return queryInterface.bulkInsert('status', [
        {
          description: 'Pendente',
          created_at: "NOW()",
          updated_at: "NOW()",
        },
        {
          description: 'Enviado para fábrica',
          created_at: "NOW()",
          updated_at: "NOW()",
        },
        {
          description: 'Enviado para assistência',
          created_at: "NOW()",
          updated_at: "NOW()",
        },
        {
          description: 'Aguardando pagamento',
          created_at: "NOW()",
          updated_at: "NOW()",
        },
        {
          description: 'Aguardando retirada',
          created_at: "NOW()",
          updated_at: "NOW()",
        },
        {
          description: 'Entregue',
          created_at: "NOW()",
          updated_at: "NOW()",
        },
      ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('status');
  },
};
