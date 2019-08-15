import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    client_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('O cliente é obrigatório.'),
    warranty_type_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('O tipo de garantia é obrigatório.'),
    product_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('O produto é obrigatório.'),
    entry_invoice: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.')
      .required('A nota de entrada é obrigatória.'),
    entry_date: yup.date().required('A data de entrada é obrigatória'),
    register_observations: yup.string(),
    serial_number: yup.string(),
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
