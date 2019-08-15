import { parse, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

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
    } = req.query;

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
      req.userId
    );

    if (isSaleman) {
      where['$client.salesman.id$'] = req.refId;
    }

    if (isClient) {
      where.client_id = req.refId;
    }

    try {
      const registers = await Register.findAll({
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

      return res.status(200).json(registers);
    } catch (err) {
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
      where['$client.salesman.id$'] = req.refId;
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
              'salesman_id',
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

    const date = parse(entry_date || new Date());

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
      return res.status(400).json(err);
    }
  }

  async update(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    // Desestruturação do body
    const {
      warranty_type_id,
      status_id,
      delivery_cost,
      repair_cost,
      exchange_value,
      register_observations,
    } = req.body;

    try {
      const register = await Register.findByPk(req.params.id);

      if (!register) {
        return res.status(404).json({
          error: 'Não foi encontrado um registro com o ID especificado.',
        });
      }

      let updateFields = {
        warranty_type_id,
        status_id,
        delivery_cost,
        repair_cost,
        exchange_value,
        register_observations,
      };

      /**
       * Verifica se o tipo de garantia foi alterado.
       */
      if (
        warranty_type_id &&
        register.warranty_type_id !== 2 &&
        warranty_type_id !== register.warranty_type_id
      ) {
        updateFields = {
          ...updateFields,
          exchange_mail: true,
        };
      }

      /**
       * Verifica se o status é diferente do atual.
       */
      if (status_id && status_id !== register.status_id) {
        updateFields = {
          ...updateFields,
          last_status_date: parse(new Date()),
        };
      }

      try {
        await register.update(updateFields, {
          where: {
            id: req.params.id,
          },
        });

        return res.status(200).json(register);
      } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async delete(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    try {
      const register = await Register.findByPk(req.params.id);

      if (!register) {
        return res.status(404).json({
          error: 'Não foi encontrado um registro com o ID especificado.',
        });
      }

      try {
        await register.destroy();

        return res.status(200).json({ msg: 'Registro deletado com sucesso.' });
      } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}

export default new RegisterController();
