import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    brand_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.'),
    description: yup.string().required('A descrição do produto é obrigatória.'),
    unit: yup.string(),
    ncm: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.'),
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
