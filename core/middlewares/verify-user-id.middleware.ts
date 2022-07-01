import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../lib/http-status';
import { scope } from './access.user';

export async function verifyUserId(req: Request, resp: Response, next: NextFunction) {
  const id = req.params.id ?? req.body.userId;
  const { jwt } = resp.locals;

  if (scope(jwt.id, id)) {
    resp.status(HttpStatus.FORBIDDEN).json({ message: 'You are forbidden to access this data' });

    return;
  }

  next();
}
