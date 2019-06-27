import * as yup from 'yup';

import User from '../models/User';

class UserController {
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

    const { email, document } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'E-mail já utilizado.' });
    }

    const checkDocument = await User.findOne({ where: { document }});

    if (checkDocument) {
      return res.status(400).json({ error: 'CPF ou CNPJ já utilizado.'});
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
      document,
      admin,
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
