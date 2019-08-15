import * as yup from 'yup';
import { Op } from 'sequelize';

import Salesman from '../models/Salesman';
import User from '../models/User';

class SalesmanController {
  async index(req, res) {
    const where = {};

    if (req.query.id) {
      where.id = req.query.id;
    }

    if (req.query.name) {
      where.name = { [Op.iLike]: `%${req.query.name}%` };
    }

    if (req.query.document) {
      where.document = { [Op.iLike]: `%${req.query.document}%` };
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

    const salesmen = await Salesman.findAll({
      attributes: ['id', 'name', 'document'],
      where,
    });

    return res.status(200).json(salesmen);
  }

  async show(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const salesman = await Salesman.findByPk(req.params.id, {
      attributes: ['id', 'name', 'document'],
    });

    if (!salesman) {
      return res.status(404).json({
        error: 'Não foi encontrado um representante com o ID informado.',
      });
    }

    return res.status(200).json(salesman);
  }

  async store(req, res) {
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
     * Verifica se o ID já foi utilizado.
     */
    const idExists = await Salesman.findByPk(req.body.id);

    if (idExists) {
      return res.status(400).json({
        error: `O ID já está em uso.`,
      });
    }

    /**
     * Verifica se já existe um funcionário com o documento informado.
     */
    const documentExists = await Salesman.findOne({
      where: {
        document: req.body.document,
      },
    });

    if (documentExists) {
      return res.status(400).json({
        error: `O documento já está em uso pelo representante ${documentExists.id}.`,
      });
    }

    const salesman = await Salesman.create(req.body);

    return res.status(201).json(salesman);
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

    const salesman = await Salesman.findByPk(req.params.id);

    const { document, name } = req.body;

    /**
     * Verifica se o documento já foi utilizado por outro funcionário.
     */
    const documentExists = await Salesman.findOne({
      where: {
        document,
      },
    });

    if (documentExists && document !== salesman.document) {
      return res.status(400).json({
        error: `O documento já está em uso pelo representante ${documentExists.id}.`,
      });
    }

    await salesman.update({
      name,
      document,
    });

    return res.json(salesman);
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

    const salesman = await Salesman.findByPk(req.params.id);

    if (!salesman) {
      return res.status(404).json({
        error: 'Não foi encontrado um representante com o ID informado.',
      });
    }

    await salesman.destroy();

    return res.status(200).json({ msg: 'Representante deletado com sucesso.' });
  }
}

export default new SalesmanController();
