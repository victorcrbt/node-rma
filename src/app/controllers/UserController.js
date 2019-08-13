import * as yup from 'yup';

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
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' })
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'document', 'admin', 'employee', 'client', 'reference_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['path', 'url'],
        },
      ]
    })

    return res.status(200).json(users);
  }

  async store(req, res) {
    const documentRegex = /^[0-9]+$/;

    const validationSchema = yup.object().shape({
      name: yup.string().required('O nome é obrigatório.'),
      email: yup
        .string()
        .email()
        .required('O e-mail é obrigatório.'),
      document: yup
        .string('O documento só pode conter números.')
        .min(11, 'O documento deve conter ao menos 11 números.')
        .max(14, 'O documento deve conter no máximo 14 números.')
        .matches(documentRegex, 'O documento deve conter apenas números.')
        .required('O documento é obrigatório.'),
      password: yup
        .string()
        .min(6, 'A senha deve conter pelo menos 6 caracteres.')
        .required('A senha é obrigatória.'),
      register_type: yup.string().required('O tipo de registro é obrigatório.')
    });

    // Validação dos campos
    try {
      // Procura por erros na entrada de dados. Se não houver, prossegue com o código.
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      // Lista todos os erros e insere no array o campo e a mensagem de cada um.
      err.inner.map(error => {
        const infos = {
          field: error.path,
          error: error.message,
        };

        errors.push(infos);
      });

      // Se existir qualque erro de validação, retorna em formato json com o campo e a mensagem.
      return res.status(400).send({ error: errors });
    }

    const { name, email, document, password, register_type } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).send({ error: 'E-mail já utilizado.' });
    }

    const checkDocument = await User.findOne({ where: { document }});

    if (checkDocument) {
      return res.status(400).send({ error: 'CPF ou CNPJ já utilizado.'});
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
          document
        }
      })

      if (!employeeExists) {
        return res.status(401).send({ error: 'Não existe um funcionário cadastrado com o documento informado.' });
      }

      reference_id = employeeExists.id;
      employee = true
    }

    // Representante
    if (register_type === 'salesman') {
      const salesmanExists = await Salesman.findOne({
        where: {
          document
        }
      })

      if (!salesmanExists) {
        return res.status(401).send({ error: 'Não existe um representante cadastrado com o documento informado.' });
      }

      reference_id = salesmanExists.id;
      salesman = true;
    }

    // Cliente
    if (register_type === 'client') {
      const clientExists = await Client.findOne({
        where: {
          document
        }
      })

      if (!clientExists) {
        return res.status(401).send({ error: 'Não existe um cliente cadastrado com o documento informado.' });
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
    const validationSchema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email('Formato de e-mail inválido.'),
      oldPassword: yup.string(),
      password: yup
        .string()
        .when('oldPassword', (oldPassword, field) =>
          oldPassword
            ? field
                .required('A senha é obrigatória.')
                .min(6, 'A senha deve conter pelo menos 6 caracteres')
            : field
        ),
      confirmPassword: yup
        .string()
        .when('password', (password, field) =>
          password
            ? field
                .required('A confirmação de senha é obrigatória.')
                .oneOf([yup.ref('password')], 'As senhas não coincidem.')
            : field
        ),
    });

    // Validação dos campos
    try {
      // Procura por erros na entrada de dados. Se não houver, prossegue com o código.
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      // Lista todos os erros e insere no array o campo e a mensagem de cada um.
      err.inner.map(error => {
        const infos = {
          field: error.path,
          error: error.message,
        };

        errors.push(infos);
      });

      // Se existir qualque erro de validação, retorna em formato json com o campo e a mensagem.
      return res.status(400).json({ error: errors });
    }

    const { password, oldPassword, email } = req.body;

    const user = await User.findByPk(req.userId);

    // Se o e-mail for enviad, verifica se o novo já está em uso
    if (email && user.email !== email) {
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
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res
        .status(401)
        .json({ error: 'A senha antiga informada está incorreta.' });
    }

    const { name, admin, reference_id } = await user.update(req.body);

    return res.status(200).json({
      msg: 'Usuário atualizado com sucesso!',
      name,
      email,
      admin,
      reference_id,
    });
  }
}

export default new UserController();
