import { parse } from 'date-fns';

import User from '../models/User';
import Client from '../models/Client';
import Product from '../models/Product';
import Register from '../models/Register';

import Queue from '../../lib/Queue';
import ProductExchangeMail from '../jobs/ProductExchangeMail';

class StoreRegisterService {
  async run({ user_id, user_input }) {
    const { admin, employee } = await User.findByPk(user_id);

    if (!admin && !employee) {
      const error = new Error(
        'Você não tem permissão para realizar esta ação.'
      );
      error.status = 401;
      throw error;
    }

    const {
      client_id,
      warranty_type_id,
      product_id,
      entry_invoice,
      entry_date,
      delivery_cost,
      repair_cost,
      exchange_value,
      register_observations,
      serial_number,
    } = user_input;

    const date = parse(entry_date || new Date());

    const clientExists = await Client.findByPk(client_id);

    if (!clientExists) {
      const error = new Error('O cliente informado não está cadastrado.');
      error.status = 404;
      throw error;
    }

    const productExists = await Product.findByPk(product_id);

    if (!productExists) {
      const error = new Error('O produto informado não está cadastrado');
      error.status = 404;
      throw error;
    }

    const { id } = await Register.create({
      user_id,
      client_id,
      warranty_type_id,
      status_id: 1, // Sempre será cadastrado como pendente.
      product_id,
      entry_invoice,
      entry_date: date,
      delivery_cost,
      repair_cost,
      exchange_value,
      exchange_mail: Number(warranty_type_id) === 2 && true,
      register_observations,
      serial_number,
    });

    const register = await Register.findByPk(id, {
      include: [
        {
          association: 'client',
        },
        {
          association: 'product',
        },
      ],
    });

    if (Number(warranty_type_id) === 2) {
      await Queue.add(ProductExchangeMail.key, { register });
    }

    return register;
  }
}

export default new StoreRegisterService();
