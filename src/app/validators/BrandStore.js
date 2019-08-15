import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número digitado não é válido.')
      .required('O código é obrigatório.'),
    description: yup.string().required('O nome da marca é obrigatória.'),
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
