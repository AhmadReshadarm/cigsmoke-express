import * as jwt from 'jsonwebtoken';

export const refreshToken = (payload: object) => {
  return jwt.sign(payload, 'REFRESH_SECRET_TOKEN', { expiresIn: '1d' }); // TODO add envoirment variables
};
