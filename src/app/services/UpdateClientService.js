import User from '../models/User';
import Client from '../models/Client';
import Salesman from '../models/Salesman';

class UpdateClientService {
  async run({ client_id, user_id, user_input }) {
    const { admin, employee } = await User.findByPk(user_id);

    if (!admin && !employee) {
      const error = new Error(
        'Você não tem permissão para realizar esta ação.'
      );
      error.status = 401;
      throw error;
    }

    /**
     * Define os campos a serem atualizados.
     */
    let updateFields = {};

    Object.keys(user_input).map(key => {
      if (key === 'id') return;

      updateFields = { ...updateFields, [key]: user_input[key] };
    });

    const client = await Client.findByPk(client_id);

    if (!client) {
      const error = new Error(
        'Não foi encontrado um cliente com o ID específicado.'
      );
      error.status = 404;
      throw error;
    }

    const documentAlreadyUsed = await Client.findOne({
      where: {
        document: updateFields.document,
      },
    });

    if (documentAlreadyUsed && updateFields.document !== client.document) {
      const error = new Error(
        `O documento já está em uso pelo cliente ${documentAlreadyUsed.id}.`
      );
      error.status = 404;
      throw error;
    }

    const salesmanExists = await Salesman.findByPk(updateFields.salesman_id);

    if (updateFields.salesman_id && !salesmanExists) {
      const error = new Error('O representante indicado não está cadastrado.');
      error.status = 404;
      throw error;
    }

    await client.update(updateFields);

    return client;
  }
}

export default new UpdateClientService();
