import * as yup from 'yup';

export default async (req, res, next) => {
  const schema = yup.object().shape({
    id: yup
      .number()
      .max(Number.MAX_SAFE_INTEGER, 'O número digitado não é válido.')
      .required('O código é obrigatório.'),
    company_name: yup.string().required('A razão social é obrigatória.'),
    document: yup.string().required('O documento é obrigatório.'),
    address: yup.string().required('O endereço é obrigatório.'),
    address_number: yup
      .string()
      .required('O número do endereço é obrigatório.'),
    neighborhood: yup.string().required('O bairro é obrigatório.'),
    zip_code: yup.string().required('O CEP é obrigatório.'),
    city: yup.string().required('A cidade é obrigatória.'),
    state: yup.string().required('A UF é obrigatória.'),
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
