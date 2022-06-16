import * as jwt from 'jsonwebtoken';

export const accessToken = (payload: object) => {
  return jwt.sign(payload, 'ACCESS_SECRET_TOKEN', { expiresIn: '15min' }); // TODO add envoirment variables
};
