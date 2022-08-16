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
import { changePasswordLimiter } from '../functions/rate.limit';

@singleton()
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @Middleware([verifyToken, isAdmin])
  async getUsers(req: Request, resp: Response) {
    const users = await this.userService.getUsers(req.query);

    const result = users.rows.map(user => {
      const { password, ...other } = user;
      return other;
    });

    resp
      .json({
        rows: result,
        length: users.length,
      })
      .status(HttpStatus.OK);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser, verifyUserId])
  async getUser(req: Request, resp: Response) {
    const { id } = req.params;

    const user = await this.userService.getUser(id);
    const { password, ...other } = user;

    resp.json(other).status(HttpStatus.OK);
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

  @Put('changepsw/:id')
  @Middleware([verifyToken, isUser, verifyUserId, changePasswordLimiter])
  async changePassword(req: Request, resp: Response) {
    const { id } = req.params;
    const { oldPassword, password } = req.body;
    console.log(oldPassword, password);

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const user = await this.userService.getUser(id);
    const validated = await bcrypt.compare(password, user.password);
    if (validated) {
      resp.status(HttpStatus.CONFLICT).json({ message: 'Can not use the same password as previous' });
      return;
    }
    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPass,
      isVerified: true,
      role: Role.User,
    };

    await this.userService.updateUser(id, payload);
    resp.status(HttpStatus.OK).json({ message: 'password changed' });
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async removeUser(req: Request, resp: Response) {
    const { id } = req.params;

    const removed = await this.userService.removeUser(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
