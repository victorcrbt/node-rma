import { parse } from 'date-fns';

import User from '../models/User';
import Client from '../models/Client';
import Product from '../models/Product';
import Register from '../models/Register';

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

    return Register.create({
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
      register_observations,
      serial_number,
    });
  }
}

export default new StoreRegisterService();
