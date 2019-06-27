import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import jwtConfig from '../../config/jwt';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não enviado.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, jwtConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};
