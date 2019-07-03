import Employee from '../models/Employee';
import User from '../models/User';

class EmployeeController {
  async index(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const employees = await Employee.findAll({
      attributes: ['id', 'name', 'document']
    })

    return res.status(200).json(employees);
  }

  async store(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Verifica se já existe um funcionário com o documento informado.
     */
    const documentExists = await Employee.findOne({
      where: {
        document: req.body.document
      }
    })

    if (documentExists) {
      return res.status(400).json({ error: `O documento já está em uso pelo funcionário ${documentExists.id}.` })
    }

    const { id, name, document } = await Employee.create(req.body);

    return res.status(201).json({ id, name, document });
  }
}

export default new EmployeeController();
