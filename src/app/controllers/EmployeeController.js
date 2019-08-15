import * as yup from 'yup';

import Employee from '../models/Employee';
import User from '../models/User';

class EmployeeController {
  async index(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const employees = await Employee.findAll({
      attributes: ['id', 'name', 'document'],
    });

    return res.status(200).json(employees);
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

    const emp = await Employee.findByPk(req.params.id, {
      attributes: ['id', 'name', 'document'],
    });

    if (!emp) {
      return res.status(404).json({
        error: 'Não foi encontrado um funcionário com o ID informado.',
      });
    }

    return res.status(200).json(emp);
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
     * Verifica se já existe um funcionário com o documento informado.
     */
    const documentExists = await Employee.findOne({
      where: {
        document: req.body.document,
      },
    });

    if (documentExists) {
      return res.status(400).json({
        error: `O documento já está em uso pelo funcionário ${documentExists.id}.`,
      });
    }

    const { id, name, document } = await Employee.create(req.body);

    return res.status(201).json({ id, name, document });
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

    const emp = await Employee.findByPk(req.params.id);

    const { document } = req.body;

    /**
     * Verifica se o documento já foi utilizado por outro funcionário.
     */
    const documentExists = await Employee.findOne({
      where: {
        document,
      },
    });

    if (documentExists && document !== emp.document) {
      return res.status(400).json({
        error: `O documento já está em uso pelo funcionário ${documentExists.id}.`,
      });
    }

    emp.update(req.body);

    return res.json(emp);
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

    const emp = await Employee.findByPk(req.params.id);

    if (!emp) {
      return res.status(404).json({
        error: 'Não foi encontrado um funcionário com o ID informado.',
      });
    }

    emp.destroy();

    return res.status(200).json({ msg: 'Funcionário deletado com sucesso.' });
  }
}

export default new EmployeeController();
