import { Op } from 'sequelize';

import Brand from '../models/Brand';
import User from '../models/User';

class BrandController {
  async index(req, res) {
    const { id, description } = req.query;

    const where = {};

    if (id) {
      where.id = id;
    }

    if (description) {
      where.description = { [Op.iLike]: `%${description}%` };
    }

    const brands = await Brand.findAll({
      where,
      attributes: ['id', 'description'],
    });

    return res.status(200).json(brands);
  }

  async show(req, res) {
    const brand = await Brand.findByPk(req.params.id);

    return res.status(200).json(brand);
  }

  async store(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isEmployee && !isAdmin) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const { id, description } = req.body;

    const usedId = await Brand.findByPk(id);

    if (usedId) {
      return res.status(400).json({ error: 'ID já utilizado.' });
    }

    const usedDescription = await Brand.findOne({
      where: {
        description,
      },
    });

    if (usedDescription) {
      return res.status(400).json({
        error: `Já existe uma marca cadastrada com esta descrição com o código ${usedDescription.id}.`,
      });
    }

    const brand = await Brand.create(req.body);

    return res.json(brand);
  }

  async update(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isEmployee && !isAdmin) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado uma marca com o ID informado.' });
    }

    const { description } = req.body;

    const usedDescription = await Brand.findOne({
      where: {
        description,
      },
    });

    if (usedDescription && description !== brand.description) {
      return res.status(400).json({
        error: `Já existe uma marca cadastrada com esta descrição com o código ${usedDescription.id}.`,
      });
    }

    brand.description = description;

    await brand.save();

    return res.json(brand);
  }

  async delete(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isEmployee && !isAdmin) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado uma marca com o ID informado.' });
    }

    await brand.destroy();

    return res.status(200).json({ msg: 'Deletado com sucesso.' });
  }
}

export default new BrandController();
