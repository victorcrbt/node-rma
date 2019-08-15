import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
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

  try {
    await schema.validate(req.body, { abortEarly: false });

    next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Falha na validação', messages: err.inner });
  }
};
