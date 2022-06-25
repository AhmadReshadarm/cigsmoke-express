import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import * as bcrypt from 'bcrypt';
import { User } from '../../core/entities/user/user.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { UserService } from '../user.service';
import { Role } from '../../core/lib/roles.enum';
import { verifyToken } from '../../core/middlewares/verify.token';
import { unAuthorized } from '../../core/middlewares/access.user';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';

@singleton()
@Controller('/admin')
export class AdminController {
  constructor(private userService: UserService) {}

  @Get('user/:adminId')
  @Middleware([verifyToken])
  async getUser(req: Request, resp: Response) {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const { id } = req.body;
    const admin = await this.userService.getUser(adminId);
    if (unAuthorized(admin.role, jwt.id, admin.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    const user = await this.userService.getUser(id);
    resp.status(HttpStatus.OK).send(user);
  }

  @Get(':adminId')
  @Middleware([verifyToken])
  async getUsers(req: Request, resp: Response) {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.role, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    const users = await this.userService.getUsers();
    resp.status(HttpStatus.OK).json(users);
  }

  @Post(':adminId')
  @Middleware([verifyToken])
  async createUser(req: Request, resp: Response) {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.role, jwt.id, user.id)) {
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
      role: req.body.isAdmin ? Role.Admin : Role.User,
    };
    const newUser = await validation(new User(payload));
    const created = await this.userService.createUser(newUser);
    const { id } = created;
    resp.status(HttpStatus.CREATED).json({ id });
  }

  @Put(':adminId')
  @Middleware([verifyToken])
  async UpdateUser(req: Request, resp: Response) {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const { id } = req.body;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.role, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const updated = await this.userService.updateUser(id, req.body);
    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':adminId')
  @Middleware([verifyToken])
  async RemoveUser(req: Request, resp: Response) {
    const { adminId } = req.params;
    const { jwt } = resp.locals;
    const { id } = req.body;
    const user = await this.userService.getUser(adminId);
    if (unAuthorized(user.role, jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }
    const removed = await this.userService.removeUser(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
