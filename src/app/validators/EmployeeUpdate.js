import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    name: yup.string().required('O nome é obrigatório.'),
    document: yup.string().required('O documento é obrigatório.'),
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
