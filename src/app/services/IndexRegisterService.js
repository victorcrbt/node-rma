import { Op } from 'sequelize';
import { startOfDay, endOfDay, parse } from 'date-fns';

import User from '../models/User';
import Register from '../models/Register';

class IndexRegisterService {
  async run({ query_params, user_id, reference_id }) {
    const where = {};
    const numberRegex = /^[0-9]*$/; // Testa se o parâmetro enviado contém somente números.

    const {
      id,
      product,
      client,
      brand_id,
      entry_date,
      last_status_date,
      warranty_type_id,
      status_id,
    } = query_params;

    if (id) {
      where.id = id;
    }

    if (product) {
      where[Op.or] = [
        {
          /**
           * Verifica se o valor enviado contém somente números. Se sim, transforma a string em número e faz a busca,
           * caso contrário, deixa o campo nulo.
           */
          '$product.id$': numberRegex.test(product) ? Number(product) : null,
        },
        {
          '$product.description$': { [Op.iLike]: `%${product}%` },
        },
      ];
    }

    if (client) {
      where[Op.or] = [
        {
          /**
           * Verifica se o valor enviado contém somente números. Se sim, transforma a string em número e faz a busca,
           * caso contrário, deixa o campo nulo.
           */
          '$client.id$': numberRegex.test(client) ? Number(client) : null,
        },
        {
          '$client.company_name$': { [Op.iLike]: `%${client}%` },
        },
      ];
    }

    if (brand_id) {
      where['$product.brand.id$'] = brand_id;
    }

    if (entry_date) {
      where.entry_date = {
        [Op.between]: [
          startOfDay(parse(entry_date)),
          endOfDay(parse(entry_date)),
        ],
      };
    }

    if (last_status_date) {
      where.last_status_date = {
        [Op.between]: [
          startOfDay(parse(last_status_date)),
          endOfDay(parse(last_status_date)),
        ],
      };
    }

    if (warranty_type_id) {
      where.warranty_type_id = warranty_type_id;
    }

    if (status_id) {
      where.status_id = status_id;
    }

    /**
     * Verifica o tipo de usuário para retornar os dados de acordo.
     */
    const { salesman: isSaleman, client: isClient } = await User.findByPk(
      user_id
    );

    if (isSaleman) {
      where['$client.salesman.id$'] = reference_id;
    }

    if (isClient) {
      where.client_id = reference_id;
    }

    return Register.findAll({
      where,
      include: [
        {
          association: 'user',
          attributes: ['id', 'name'],
        },
        {
          association: 'client',
          attributes: [
            'id',
            'company_name',
            'document',
            'address',
            'address_number',
            'neighborhood',
            'zip_code',
            'city',
            'state',
            'phone',
            'email',
          ],
          include: [
            {
              association: 'salesman',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          association: 'warranty_type',
          attributes: ['id', 'description'],
        },
        {
          association: 'status',
          attributes: ['id', 'description'],
        },
        {
          association: 'product',
          attributes: ['id', 'description', 'unit'],
          include: [
            {
              association: 'brand',
              attributes: ['id', 'description'],
            },
          ],
        },
      ],
    });
  }
}

export default new IndexRegisterService();
