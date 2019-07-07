import { parse } from 'date-fns';

import Register from '../models/Register';
import User from '../models/User';
import Client from '../models/Client';
import Salesman from '../models/Salesman';
import WarrantyType from '../models/WarrantyType';
import Status from '../models/Status';
import Product from '../models/Product';
import Brand from '../models/Brand';

class RegisterController {
  async store(req, res) {
    const {
      client_id,
      salesman_id,
      warranty_type_id,
      status_id,
      product_id,
      brand_id,
      entry_invoice,
      entry_date,
      delivery_cost,
      repair_cost,
      exchange_value,
      register_observations,
      serial_number,
    } = req.body;

    const date = parse(entry_date);

    /**
     * Verifica se o cliente existe.
     */
    const client = await Client.findByPk(client_id);

    if (!client) {
      return res
        .status(404)
        .json({ error: 'O cliente informado não está cadastrado.' });
    }

    /**
     * Verifica se o produto existe.
     */
    const product = await Product.findByPk(product_id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'O produto informado não está cadastrado.' });
    }

    try {
      const register = await Register.create({
        user_id: req.userId,
        client_id,
        salesman_id: client.salesman_id, // Não precisa ser enviado
        warranty_type_id,
        status_id: 1, // Não precisa ser enviado
        product_id,
        brand_id: product.brand_id, // Não precisa ser enviado
        entry_invoice,
        entry_date: date,
        delivery_cost,
        repair_cost,
        exchange_value,
        register_observations,
        serial_number,
      });

      return res.json(register);
    } catch (err) {
      console.log(err);

      return res.status(400).json(err);
    }
  }
}

export default new RegisterController();
