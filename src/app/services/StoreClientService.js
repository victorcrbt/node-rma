import User from '../models/User';
import Client from '../models/Client';
import Salesman from '../models/Salesman';

class StoreClientService {
  async run({ user_id, user_input }) {
    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(user_id);

    if (!admin && !employee) {
      const error = new Error(
        'Você não tem permissão para realizar esta ação.'
      );
      error.status = 401;
      throw error;
    }

    const idAlreadyUsed = await Client.findByPk(user_input.id);

    if (idAlreadyUsed) {
      const error = new Error('O ID já está em uso.');
      error.status = 400;
      throw error;
    }

    const documentAlreadyUsed = await Client.findOne({
      where: {
        document: user_input.document,
      },
    });

    if (documentAlreadyUsed) {
      const error = new Error(
        `O documento já está em uso pelo cliente ${documentAlreadyUsed.id}.`
      );
      error.status = 400;
      throw error;
    }

    const salesmanExists = await Salesman.findByPk(user_input.salesman_id);

    if (user_input.salesman_id && !salesmanExists) {
      const error = new Error('O representante informado não está cadastrado.');
      error.status = 404;
      throw error;
    }

    // const client = await ;

    return Client.create(user_input);
  }
}

export default new StoreClientService();
