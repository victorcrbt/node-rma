import { Op } from 'sequelize';

import Brand from '../models/Brand';
import User from '../models/User';

class BrandController {
  async index(req, res) {
    const where = {};

    const { id, description } = req.query;

    /**
     * Verifica se o id foi enviado na query
     */
    if (id) {
      where.id = id;
    }

    /**
     * Verifica se a descrição foi enviada na query
     */
    if (description) {
      where.description = { [Op.iLike]: `%${description}%` };
    }

    const brands = await Brand.findAll({
      where,
      attributes: ['id', 'description'],
    });

    return res.status(200).json(brands);
  }

  async store(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!employee && !admin) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' })
    }

    const { id, description } = req.body;

    /**
     * Verifica se o ID  já foi utilizado.
     */
    const usedId = await Brand.findByPk(id);

    if (usedId) {
      return res.status(400).json({ error: "ID já utilizado."})
    }

    /**
     * Verifica se já existe uma marca com a mesma descrição.
     */
    const usedDescription = await Brand.findOne({
      where: {
        description,
      }
    });

    if (usedDescription) {
      return res.status(400).json({ error: `Já existe uma marca cadastrada com esta descrição com o código ${usedDescription.id}.` });
    }

    const brand = await Brand.create(req.body);

    return res.json(brand);
  }

  async update(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!employee && !admin) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' })
    }

    const { description } = req.body;

    const brand = await Brand.findByPk(req.params.id);

    /**
     * Verifica se a marca existe.
     */
    if (!brand) {
      return res.status(404).json({ error: 'Não foi encontrado uma marca com o ID informado.' });
    }

    const usedDescription = await Brand.findOne({
      where: {
        description
      }
    });

    if (usedDescription && (description !== brand.description)) {
      return res.status(400).json({ error: `Já existe uma marca cadastrada com esta descrição com o código ${usedDescription.id}.` });
    }

    brand.description = description;

    await brand.save();

    return res.json(brand);
  }

  async delete(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!employee && !admin) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' })
    }

    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
      return res.status(404).json({ error: 'Não foi encontrado uma marca com o ID informado.' });
    }

    await brand.destroy();

    return res.status(200).json({ msg: 'Deletado com sucesso.' });
  }
}

export default new BrandController();
