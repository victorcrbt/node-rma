import { Op } from 'sequelize';
import * as yup from 'yup';

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

    /**
     * Verifica se o id foi enviado
     */
    if (id) {
      where.id = id;
    }

    /**
     * Verifica se a descrição foi enviada
     */
    if (description) {
      where.description = { [Op.iLike]: `%${description}%` };
    }

    /**
     * Verifica se a marca foi enviada
     */
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
        }
      ]
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
        }
      ]
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    return res.status(200).json(product);
  }

  async store(req, res) {
    const validationSchema = yup.object().shape({
      id: yup
        .number()
        .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
        .required('O código do produto é obrigatório.'),
      brand_id: yup
        .number()
        .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
        .required('A marca é obrigatória.'),
      description: yup
        .string()
        .required('A descrição do produto é obrigatória.'),
      unit: yup.string().required('A unidade é obrigatória.'),
      ncm: yup
        .number()
        .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
        .required('O NCM é obrigatório.'),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      err.inner.map(error => {
        const infos = {
          field: error.path,
          error: error.message,
        };

        errors.push(infos);
      });

      return res.status(400).json({ error: errors });
    }

    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Verifica e o ID já foi utilizado.
     */
    const idExists = await Product.findByPk(req.body.id);

    if (idExists) {
      return res.status(400).json({ error: 'O ID já está em uso.' });
    }

    /**
     * Verifica se existe outro produto com a mesma descrição.
     */
    const descriptionExists = await Product.findOne({
      where: {
        description: req.body.description,
      },
    });

    if (descriptionExists) {
      return res.status(400).json({
        error: `Descriçao já utilizada no produto ${descriptionExists.id}.`,
      });
    }

    /**
     * Verifica se a marca está cadastrada.
     */
    const brandExists = await Brand.findByPk(req.body.brand_id);

    if (!brandExists) {
      return res
        .status(404)
        .json({ error: 'A marca informada não está cadastrada.' });
    }

    /**
     * Insere o produto no banco de dados.
     */
    const product = await Product.create(req.body);

    return res.status(201).json(product);
  }

  async update(req, res) {
    const validationSchema = yup.object().shape({
      brand_id: yup
        .number()
        .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.'),
      description: yup
        .string()
        .required('A descrição do produto é obrigatória.'),
      unit: yup.string(),
      ncm: yup
        .number()
        .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.'),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      err.inner.map(error => {
        const infos = {
          field: error.path,
          error: error.message,
        };

        errors.push(infos);
      });

      return res.status(400).json({ error: errors });
    }

    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Remove o ID dos campos que podem ser atualizados.
     */
    let updateFields = {};

    Object.keys(req.body).map(key => {
      if (key !== 'id') {
        updateFields = { ...updateFields, [key]: req.body[key] };
      }
    });

    /**
     * Verifica se o produto existe.
     */
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    /**
     * Verifica se a marca está cadastrada.
     */
    const brandExists = await Brand.findByPk(updateFields.brand_id);

    if (updateFields.brand_id && !brandExists) {
      return res
        .status(404)
        .json({ error: 'A marca informada não está cadastrada.' });
    }

    /**
     * Salva as atualizações.
     */
    await product.update(req.body);

    return res.json(product);
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

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    await product.destroy();

    return res.status(200).json({ msg: 'Produto deletado com sucesso.' });
  }
}

export default new ProductController();
