import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    email: yup.string().required('O e-mail não pode estar em branco.'),
    password: yup.string().required('A senha não pode estar em branco.'),
  });

  try {
    await schema.validate(req.body, { abortEarly: false });

    next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Falha na validação.', messages: err.inner });
  }
};
