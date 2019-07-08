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
  async index(req, res) {
    let where = {};

    /**
     * Verifica o tipo de usuário para retornar os dados de acordo.
     */
    const { salesman, client } = await User.findByPk(req.userId);

    if (salesman) {
      where = {
        ...where,
        salesman_id: req.refId,
      };
    }

    if (client) {
      where = {
        ...where,
        client_id: req.refId,
      };
    }

    try {
      const registers = await Register.findOne({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
          {
            model: Client,
            as: 'client',
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
              'area_code',
              'phone_number',
              'email',
            ],
            include: [
              {
                model: Salesman,
                as: 'salesman',
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: WarrantyType,
            as: 'warranty_type',
            attributes: ['id', 'description'],
          },
          {
            model: Status,
            as: 'status',
            attributes: ['id', 'description'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'description', 'unit'],
            include: [
              {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'description'],
              },
            ],
          },
        ],
      });

      return res.status(200).json(registers);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async show(req, res) {
    let where = {
      id: req.params.id,
    };

    /**
     * Verifica o tipo de usuário para retornar os dados de acordo.
     */
    const { salesman, client } = await User.findByPk(req.userId);

    if (salesman) {
      where = {
        ...where,
        salesman_id: req.refId,
      };
    }

    if (client) {
      where = {
        ...where,
        client_id: req.refId,
      };
    }

    try {
      const register = await Register.findOne({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
          {
            model: Client,
            as: 'client',
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
              'area_code',
              'phone_number',
              'email',
            ],
            include: [
              {
                model: Salesman,
                as: 'salesman',
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: WarrantyType,
            as: 'warranty_type',
            attributes: ['id', 'description'],
          },
          {
            model: Status,
            as: 'status',
            attributes: ['id', 'description'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'description', 'unit'],
            include: [
              {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'description'],
              },
            ],
          },
        ],
      });

      if (!register) {
        return res.status(404).json({ error: 'Nenhum registro encontrado.' });
      }

      return res.status(200).json(register);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async store(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
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
        warranty_type_id,
        status_id: 1, // Não precisa ser enviado
        product_id,
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
