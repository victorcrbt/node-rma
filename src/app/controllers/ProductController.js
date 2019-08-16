import { Op } from 'sequelize';

import Product from '../models/Product';
import User from '../models/User';
import Brand from '../models/Brand';

class ProductController {
  async index(req, res) {
    const where = {};
    const numberRegex = /^[0-9]*$/; // Testa se o parâmetro enviado contém somente números.

    const { product, id, description, brand_id } = req.query;

    if (product) {
      where[Op.or] = [
        {
          /**
           * Verifica se o valor enviado contém somente números. Se sim, transforma a string em número e faz a busca,
           * caso contrário, deixa o campo nulo.
           */
          id: numberRegex.test(product) ? Number(product) : null,
        },
        {
          description: { [Op.iLike]: `%${product}%` },
        },
      ];
    }

    if (id) {
      where.id = id;
    }

    if (description) {
      where.description = { [Op.iLike]: `%${description}%` };
    }

    if (brand_id) {
      where.brand_id = brand_id;
    }

    const products = await Product.findAll({
      where,
      attributes: ['id', 'brand_id', 'description', 'unit', 'ncm'],
      include: [
        {
          model: Brand,
          as: 'brand',
          attributes: ['description'],
        },
      ],
    });

    return res.status(200).json(products);
  }

  async show(req, res) {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'brand_id', 'description', 'unit', 'ncm'],
      include: [
        {
          model: Brand,
          as: 'brand',
          attributes: ['description'],
        },
      ],
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    return res.status(200).json(product);
  }

  async store(req, res) {
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const idAlreadyUsed = await Product.findByPk(req.body.id);

    if (idAlreadyUsed) {
      return res.status(400).json({ error: 'O ID já está em uso.' });
    }

    const descriptionAlreadyUsed = await Product.findOne({
      where: {
        description: req.body.description,
      },
    });

    if (descriptionAlreadyUsed) {
      return res.status(400).json({
        error: `Descriçao já utilizada no produto ${descriptionAlreadyUsed.id}.`,
      });
    }

    const brandExists = await Brand.findByPk(req.body.brand_id);

    if (!brandExists) {
      return res
        .status(404)
        .json({ error: 'A marca informada não está cadastrada.' });
    }

    const product = await Product.create(req.body);

    return res.status(201).json(product);
  }

  async update(req, res) {
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    let updateFields = {};

    Object.keys(req.body).map(key => {
      if (key === 'id') return;

      updateFields = { ...updateFields, [key]: req.body[key] };
    });

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    const brandExists = await Brand.findByPk(updateFields.brand_id);

    if (updateFields.brand_id && !brandExists) {
      return res
        .status(404)
        .json({ error: 'A marca informada não está cadastrada.' });
    }

    await product.update(req.body);

    return res.json(product);
  }

  async delete(req, res) {
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    await product.destroy();

    return res.status(200).json({ message: 'Produto deletado com sucesso.' });
  }
}

export default new ProductController();
