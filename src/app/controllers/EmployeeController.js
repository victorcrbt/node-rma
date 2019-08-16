import Employee from '../models/Employee';
import User from '../models/User';

class EmployeeController {
  async index(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isAdmin && !isEmployee) {
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
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isAdmin && !isEmployee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const employee = await Employee.findByPk(req.params.id, {
      attributes: ['id', 'name', 'document'],
    });

    if (!employee) {
      return res.status(404).json({
        error: 'Não foi encontrado um funcionário com o ID informado.',
      });
    }

    return res.status(200).json(employee);
  }

  async store(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isAdmin && !isEmployee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const documentoAlreadyUsed = await Employee.findOne({
      where: {
        document: req.body.document,
      },
    });

    if (documentoAlreadyUsed) {
      return res.status(400).json({
        error: `O documento já está em uso pelo funcionário ${documentoAlreadyUsed.id}.`,
      });
    }

    const { id, name, document } = await Employee.create(req.body);

    return res.status(201).json({ id, name, document });
  }

  async update(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isAdmin && !isEmployee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const employee = await Employee.findByPk(req.params.id);

    const documentAlreadyUsed = await Employee.findOne({
      where: {
        document: req.body.document,
      },
    });

    if (documentAlreadyUsed && req.body.document !== employee.document) {
      return res.status(400).json({
        error: `O documento já está em uso pelo funcionário ${documentAlreadyUsed.id}.`,
      });
    }

    employee.update(req.body);

    return res.json(employee);
  }

  async delete(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(
      req.userId
    );

    if (!isAdmin && !isEmployee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({
        error: 'Não foi encontrado um funcionário com o ID informado.',
      });
    }

    employee.destroy();

    return res
      .status(200)
      .json({ message: 'Funcionário deletado com sucesso.' });
  }
}

export default new EmployeeController();
