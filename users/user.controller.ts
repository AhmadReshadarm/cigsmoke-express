import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import * as bcrypt from 'bcrypt';
import { User } from '../core/entities';
import { asyncHandler } from '../core/lib/error.handlers';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { UserService } from './user.service';
import { verifyToken } from '../middleware/verify.token';
import { unAuthorized, scope } from '../middleware/access.user';

@singleton()
export class UserController {
  readonly routes = Router();

  constructor(private userService: UserService) {
    this.routes.get('/users', this.getUserNames);
    this.routes.get('/users/:id', verifyToken, this.getUser);
    this.routes.put('/users/:id', verifyToken, this.updateUser);
    this.routes.delete('/users/:id', verifyToken, this.removeUser);
    this.routes.get('/admin/:adminId', verifyToken, this.getUsers);
    this.routes.post('/admin/:adminId', verifyToken, this.createUser);
    this.routes.put('/admin/:adminId', verifyToken, this.adminUpdateUser);
    this.routes.delete('/admin/:adminId', verifyToken, this.adminRemoveUser);
  }

  private getUserNames = asyncHandler(async (req: Request, resp: Response) => {
    const users = await this.userService.getUserNames();
    resp.json(users);
  });

  private getUser = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const { jwt } = resp.locals;

    const user = await this.userService.getUser(id);

    if (scope(jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const { password, adminSecret, ...others } = user;
    resp.json(others);
  });

  private updateUser = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(id);

    if (scope(jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const updated = await this.userService.updateUser(id, req.body);
    resp.status(HttpStatus.OK).json(updated);
  });

  private removeUser = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(id);

    if (scope(jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const removed = await this.userService.removeUser(id);

    resp.status(HttpStatus.OK).json(removed);
  });

  //  only Admin
  private getUsers = asyncHandler(async (req: Request, resp: Response) => {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.adminSecret, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    const users = await this.userService.getUsers();
    resp.json(users);
  });

  private createUser = asyncHandler(async (req: Request, resp: Response) => {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.adminSecret, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const payload = {
      id: '',
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      isVerified: true,
      password: hashedPass,
      adminSecret: req.body.isAdmin ? 'admin secret' : '',
    };
    const newUser = await validation(new User(payload));
    const created = await this.userService.createUser(newUser);
    const { id } = created;
    resp.status(HttpStatus.CREATED).json({ id });
  });

  private adminUpdateUser = asyncHandler(async (req: Request, resp: Response) => {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const { id } = req.body;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.adminSecret, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const updated = await this.userService.updateUser(id, req.body);
    resp.status(HttpStatus.OK).json(updated);
  });
  private adminRemoveUser = asyncHandler(async (req: Request, resp: Response) => {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const { id } = req.body;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.adminSecret, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const removed = await this.userService.removeUser(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
