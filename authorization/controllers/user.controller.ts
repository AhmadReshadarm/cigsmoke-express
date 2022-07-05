import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '../../core/lib/http-status';
import { UserService } from '../services/user.service';
import { isAdmin, isUser, verifyToken, verifyUserId } from '../../core/middlewares';
import { scope } from '../../core/middlewares/access.user';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { Role } from '../../core/enums/roles.enum';
import { validation } from '../../core/lib/validator';
import { User } from '../../core/entities';

@singleton()
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('')
  @Middleware([verifyToken, isAdmin])
  async getUsers(req: Request, resp: Response) {
    const users = await this.userService.getUsers();

    resp.json(users).status(HttpStatus.OK);
  }

  @Get(':id')
  @Middleware([verifyToken, verifyUserId])
  async getUser(req: Request, resp: Response) {
    const { id } = req.params;

    const user = await this.userService.getUser(id);
    const { password, ...others } = user;

    resp.json(others).status(HttpStatus.OK);
  }

  @Post(':adminId')
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

  @Put('profile/:id')
  @Middleware([verifyToken, isUser])
  async updateUserProfile(req: Request, resp: Response) {
    const { id } = req.params;
    const { jwt } = resp.locals;
    const user = await this.userService.getUser(id);

    if (scope(jwt.id, user.id)) {
      resp.status(HttpStatus.UNAUTHORIZED).json('Unauthorized');
      return;
    }

    const updated = await this.userService.updateUser(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Put(':id')
  @Middleware([verifyToken, isAdmin])
  async updateUser(req: Request, resp: Response) {
    const { id } = req.params;

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
