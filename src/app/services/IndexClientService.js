import { Op } from 'sequelize';

import User from '../models/User';
import Client from '../models/Client';

class IndexClientService {
  async run({ query_params, user_id, ref_id }) {
    const { admin, employee, salesman, client: isClient } = await User.findByPk(
      user_id
    );

    /**
     * Se, por algum motivo, o usuário não tiver nenhum tipo definido, não permite a visualização.
     */
    if (!isClient && !admin && !employee && !salesman) {
      const error = new Error(
        'Você não tem permissão para realizar esta ação.'
      );
      error.status = 401;
      throw error;
    }

    /**
     * Se o usuário for um cliente, não permite a visualização.
     */
    if (isClient) {
      const error = new Error(
        'Você não tem permissão para realizar esta ação.'
      );
      error.status = 401;
      throw error;
    }

    const where = {};
    const numberRegex = /^[0-9]*$/; // Testa se o parâmetro enviado contém somente números.

    const {
      client,
      id,
      company_name,
      document,
      address,
      address_number,
      neighborhood,
      city,
      zip_code,
      state,
      salesman_id,
    } = query_params;

    if (client) {
      where[Op.or] = [
        {
          /**
           * Verifica se o valor enviado contém somente números. Se sim, transforma a string em número e faz a busca,
           * caso contrário, deixa o campo nulo.
           */
          id: numberRegex.test(client) ? Number(client) : null,
        },
        {
          company_name: { [Op.iLike]: `%${client}%` },
        },
      ];
    }

    if (id) {
      where.id = id;
    }

    if (company_name) {
      where.company_name = { [Op.iLike]: `%${company_name}%` };
    }

    if (document) {
      where.document = { [Op.iLike]: `%${document}%` };
    }

    if (address) {
      where.address = { [Op.iLike]: `%${address}%` };
    }

    if (address_number) {
      where.address_number = address_number;
    }

    if (neighborhood) {
      where.neighborhood = { [Op.iLike]: `%${neighborhood}%` };
    }

    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    if (zip_code) {
      where.zip_code = { [Op.iLike]: `%${zip_code}%` };
    }

    if (state) {
      where.state = { [Op.iLike]: `${state}` };
    }

    if (salesman_id) {
      where.salesman_id = salesman_id;
    }

    /**
     * Se o usuário for representante, retorna apenas os seus clientes.
     */
    if (salesman) {
      where.salesman_id = ref_id;

      const clients = await Client.findAll({
        where,
      });

      return clients;
    }

    /**
     * Se o usuário for administrador e/ou funcionário comum, retorna todos os clientes.
     */
    const clients = await Client.findAll({
      where,
    });

    return clients;
  }
}

export default new IndexClientService();
