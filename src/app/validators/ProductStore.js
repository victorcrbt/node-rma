import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('O código do produto é obrigatório.'),
    brand_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('A marca é obrigatória.'),
    description: yup.string().required('A descrição do produto é obrigatória.'),
    unit: yup.string().required('A unidade é obrigatória.'),
    ncm: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('O NCM é obrigatório.'),
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
