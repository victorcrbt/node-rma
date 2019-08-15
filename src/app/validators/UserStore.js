import * as yup from 'yup';

export default async (req, res, next) => {
  const documentRegex = /^[0-9]+$/;

  const schema = yup.object().shape({
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
    register_type: yup.string().required('O tipo de registro é obrigatório.'),
  });

  try {
    await schema.validate(req.body, { abortEarly: false });

    next();
  } catch (err) {
    return res
      .status(400)
      .send({ error: 'Falha na validação.', messages: err.inner });
  }
};
