import User from '../models/User';
import File from '../models/File';
import Employee from '../models/Employee';
import Salesman from '../models/Salesman';
import Client from '../models/Client';

class UserController {
  async index(req, res) {
    /**
     * Verifica se o usuário é um administrador.
     */
    const { admin } = await User.findByPk(req.userId);

    if (!admin) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const users = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'document',
        'admin',
        'employee',
        'client',
        'reference_id',
      ],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['path', 'url'],
        },
      ],
    });

    return res.status(200).json(users);
  }

  async store(req, res) {
    const { name, email, document, password, register_type } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).send({ error: 'E-mail já utilizado.' });
    }

    const checkDocument = await User.findOne({ where: { document } });

    if (checkDocument) {
      return res.status(400).send({ error: 'CPF ou CNPJ já utilizado.' });
    }

    /**
     * Baseado no tipo de cadastro, procura pelo documento para ver se existe um funcionário, representante ou cliente com o mesmo documento.
     * Caso não encontre nenhum, retorna um erro e impede o cadastro.
     * Caso enontre, define o reference_id como sendo o ID do cadastro encontrado.
     */
    let reference_id;
    let employee = false;
    let salesman = false;
    let client = false;

    // Funcionário
    if (register_type === 'employee') {
      const employeeExists = await Employee.findOne({
        where: {
          document,
        },
      });

      if (!employeeExists) {
        return res.status(401).send({
          error:
            'Não existe um funcionário cadastrado com o documento informado.',
        });
      }

      reference_id = employeeExists.id;
      employee = true;
    }

    // Representante
    if (register_type === 'salesman') {
      const salesmanExists = await Salesman.findOne({
        where: {
          document,
        },
      });

      if (!salesmanExists) {
        return res.status(401).send({
          error:
            'Não existe um representante cadastrado com o documento informado.',
        });
      }

      reference_id = salesmanExists.id;
      salesman = true;
    }

    // Cliente
    if (register_type === 'client') {
      const clientExists = await Client.findOne({
        where: {
          document,
        },
      });

      if (!clientExists) {
        return res.status(401).send({
          error: 'Não existe um cliente cadastrado com o documento informado.',
        });
      }

      reference_id = clientExists.id;
      client = true;
    }

    await User.create({
      name,
      email,
      password,
      document,
      employee,
      salesman,
      client,
      reference_id,
    });

    return res.json({
      msg: 'Usuário cadastrado com sucesso!',
      name,
      email,
      document,
      employee,
      salesman,
      client,
      reference_id,
    });
  }

  async update(req, res) {
    const { password, oldPassword, email } = req.body;

    const userExists = await User.findByPk(req.userId);

    // Se o e-mail for enviad, verifica se o novo já está em uso
    if (email && userExists.email !== email) {
      const emailInUse = await User.findOne({ where: { email } });

      if (emailInUse) {
        return res
          .status(400)
          .json({ error: 'O e-mail informado já está em uso.' });
      }
    }

    // Verifica se o usuário tentou enviar a senha sem enviar a antiga
    if (password && !oldPassword) {
      return res
        .status(401)
        .json({ error: 'Você deve informar a senha antiga para prosseguir.' });
    }

    // Verifica se a senha antiga foi enviada, e se sim, se bate com a do banco de dados
    if (oldPassword && !(await userExists.checkPassword(oldPassword))) {
      return res
        .status(401)
        .json({ error: 'A senha antiga informada está incorreta.' });
    }

    const { id } = await userExists.update(req.body);

    const user = await User.findByPk(id, {
      include: [
        {
          association: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
      attributes: {
        exclude: [
          'avatar_id',
          'password_hash',
          'reset_token',
          'token_expiration',
          'createdAt',
          'updatedAt',
        ],
      },
    });

    return res.status(200).json(user);
  }
}

export default new UserController();
