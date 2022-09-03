import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '../../core/lib/http-status';
import { UserService } from '../services/user.service';
import { emailToken } from '../functions/email.token';
import { sendMail } from '../functions/send.mail';
import { emailConfirmationLimiter, sendTokenLimiter } from '../functions/rate.limit';
import { isAdmin, isUser, verifyToken, verifyUserId } from '../../core/middlewares';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { Role } from '../../core/enums/roles.enum';
import { validation } from '../../core/lib/validator';
import { User } from '../../core/entities';
import { changePasswordLimiter } from '../functions/rate.limit';

@singleton()
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) { }

  @Get('')
  @Middleware([verifyToken, isAdmin])
  async getUsers(req: Request, resp: Response) {
    try {
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
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Get('inner/:id')
  async getUserById(req: Request, resp: Response) {
    const { secretKey } = req.body;

    if (secretKey !== process.env.INNER_AUTH_CALL_SECRET_KEY) {
      resp.status(HttpStatus.FORBIDDEN).json({ message: 'not authorized' });
      return;
    }
    const { id } = req.params;
    try {
      const user = await this.userService.getUser(id);
      const { password, email, ...others } = user;
      return resp.json(others);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Get('user/:id')
  @Middleware([verifyToken, isUser, verifyUserId])
  async getUser(req: Request, resp: Response) {
    const { jwt } = resp.locals;

    try {
      const user = await this.userService.getUser(jwt.id);
      const { password, ...other } = user;
      resp.status(HttpStatus.OK).json(other);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Get('email-confirmation')
  @Middleware([verifyToken, isUser, sendTokenLimiter, emailConfirmationLimiter])
  async sendMailConfirmation(req: Request, resp: Response) {
    const { jwt } = resp.locals;

    try {
      const token = emailToken({ id: jwt.id, email: jwt.email });
      sendMail(token, jwt);
      resp.status(HttpStatus.OK).json({ message: 'token sent successfully' });
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Post('')
  @Middleware([verifyToken, isAdmin])
  async createUser(req: Request, resp: Response) {
    try {
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
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Put('user/:id')
  @Middleware([verifyToken, isUser, verifyUserId])
  async updateUser(req: Request, resp: Response) {
    const { id } = req.params;
    const { email } = req.body;

    if (resp.locals.user.role !== Role.Admin) {
      req.body.role = undefined;
    }

    try {
      if (email && resp.locals.user.role !== Role.Admin) {
        const user = await this.userService.getUser(id);
        const changedEmail = await this.userService.updateUser(id, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: email,
          password: user.password,
          isVerified: false,
          role: Role.User,
        });
        const { password, ...others } = changedEmail;
        resp.status(HttpStatus.OK).json(others);
        return;
      }
      const updated = await this.userService.updateUser(id, req.body);
      const { password, ...others } = updated;
      resp.status(HttpStatus.OK).json(others);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Put('changepsw/:id')
  @Middleware([verifyToken, isUser, verifyUserId, changePasswordLimiter])
  async changePassword(req: Request, resp: Response) {
    const { id } = req.params;
    const { password } = req.body;

    try {
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
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Delete('user/:id')
  @Middleware([verifyToken, isAdmin])
  async removeUser(req: Request, resp: Response) {
    const { id } = req.params;
    try {
      const removed = await this.userService.removeUser(id);

      resp.status(HttpStatus.OK).json(removed);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }
}
