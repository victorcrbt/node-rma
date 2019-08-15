import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    warranty_type_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.'),
    status_id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número informado não é válido.'),
    delivery_cost: yup.number().required('e ae'),
    repair_cost: yup.number(),
    exchange_value: yup.number(),
    register_observations: yup.string(),
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
