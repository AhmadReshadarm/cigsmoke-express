import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { HttpStatus } from '../core/lib/http-status';

export async function verifyToken(req: Request, resp: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (token == null) {
    resp.status(HttpStatus.UNAUTHORIZED).json('Unauthorized: No token found');
    return;
  }

  jwt.verify(token, 'ACCESS_SECRET_TOKEN', (error, user) => {
    if (error) return resp.status(HttpStatus.FORBIDDEN).json(`Access has been expired: ${error}`);
    resp.locals.jwt = user;
    next();
  });
}
