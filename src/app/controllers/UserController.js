import User from '../models/User';

class UserController {
  async store(req, res) {
    const { email } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'E-mail já utilizado.' });
    }

    const {
      name,
      admin,
      employee,
      salesman,
      client,
      reference_id,
    } = await User.create(req.body);

    return res.json({
      msg: 'Usuário cadastrado com sucesso!',
      name,
      email,
      admin,
      employee,
      salesman,
      client,
      reference_id,
    });
  }
}

export default new UserController();
