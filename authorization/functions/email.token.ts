import * as jwt from 'jsonwebtoken';

export const emailToken = (payload: object) => {
  return jwt.sign(payload, 'EMAIL_SECRET_TOKEN', { expiresIn: '1day' }); // TODO add envoirment variables
};
