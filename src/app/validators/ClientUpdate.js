import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    company_name: yup.string(),
    document: yup.string(),
    address: yup.string(),
    address_number: yup.string(),
    neighborhood: yup.string(),
    zip_code: yup.string(),
    city: yup.string(),
    state: yup.string(),
    email: yup.string().email('O formato de e-mail não é válido.'),
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
