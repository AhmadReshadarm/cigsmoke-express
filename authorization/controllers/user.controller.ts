import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '../../core/lib/http-status';
import { UserService } from '../services/user.service';
import { isAdmin, isUser, verifyToken, verifyUserId } from '../../core/middlewares';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { Role } from '../../core/enums/roles.enum';
import { validation } from '../../core/lib/validator';
import { User } from '../../core/entities';

@singleton()
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) { }

  @Get('')
  @Middleware([verifyToken, isAdmin])
  async getUsers(req: Request, resp: Response) {
    const users = await this.userService.getUsers(req.query);

    resp.json(users).status(HttpStatus.OK);
  }

  @Get(':id')
  @Middleware([
    // verifyToken
    // , isUser
    // , verifyUserId
  ])
  async getUser(req: Request, resp: Response) {
    const { id } = req.params;

    const user = await this.userService.getUser(id);

    resp.json(user).status(HttpStatus.OK);
  }

  @Post('')
  @Middleware([verifyToken, isAdmin])
  async createUser(req: Request, resp: Response) {
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

  @Put(':id')
  @Middleware([verifyToken, isUser, verifyUserId])
  async updateUser(req: Request, resp: Response) {
    const { id } = req.params;
    if (resp.locals.user.role !== Role.Admin) {
      req.body.isVerified = undefined;
      req.body.role = undefined;
    }

    const updated = await this.userService.updateUser(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async removeUser(req: Request, resp: Response) {
    const { id } = req.params;

    const removed = await this.userService.removeUser(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
