import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '../../core/lib/http-status';
import { Role } from '../../core/lib/roles.enum';
import { validation } from '../../core/lib/validator';
import { User } from '../../core/entities/user/user.entity';
import { UserService } from '../user.service';
import { emailToken } from '../functions/email.token';
import { accessToken } from '../functions/access.token';
import { refreshToken } from '../functions/refresh.token';
import { sendMail } from '../functions/send.mail';
import { Controller, Get, Middleware, Post, Put } from '../../core/decorators';
import { resetPasswordLimiter } from '../functions/rate.limit';

@singleton()
@Controller('/auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('signup')
  async signUp(req: Request, resp: Response) {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const payload = {
      id: '',
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      isVerified: false,
      password: hashedPass,
      role: Role.User,
    };

    const isUser = await this.userService.getEmail(payload.email);
    if (isUser) {
      resp.status(HttpStatus.FORBIDDEN).json('Already singed up');
      return;
    }
    const newUser = await validation(new User(payload));
    const created = await this.userService.createUser(newUser);
    const { password, ...others } = created;

    const token = emailToken({ id: created.id, email: created.email });
    sendMail(token, created.email);
    resp.status(HttpStatus.CREATED).json({ others });
  }

  @Post('signin')
  async signIn(req: Request, resp: Response) {
    const { email, userPassword } = req.body;

    const user = await this.userService.getEmail(email);
    if (!user) {
      resp.status(HttpStatus.BAD_REQUEST).json(`this email: ${email} does not exist in our database`);
      return;
    }

    const validated = await bcrypt.compare(userPassword, user.password);
    if (!validated) {
      resp.status(HttpStatus.BAD_REQUEST).json('Check password');
      return;
    }

    if (!user.isVerified) {
      resp.status(HttpStatus.BAD_REQUEST).json('Not verified');
      return;
    }

    const accessTokenCreated = accessToken({ id: user.id, email: user.email });
    const refreshTokenCreated: string = refreshToken({ id: user.id, email: user.email });

    const { password, ...others } = user;
    resp
      .status(HttpStatus.CREATED)
      .json({ others, accessToken: accessTokenCreated, refreshToken: refreshTokenCreated });
  }

  @Post('token')
  async createToken(req: Request, resp: Response) {
    const { token } = req.body;
    if (token === null) {
      resp.status(HttpStatus.UNAUTHORIZED);
      return;
    }
    const { REFRESH_SECRET_TOKEN } = process.env;
    jwt.verify(token, REFRESH_SECRET_TOKEN, async (error: any, user: any) => {
      if (error) {
        resp.status(HttpStatus.FORBIDDEN).json('token is expired');
        return;
      }
      const accessTokenCreated = accessToken({ id: user.id, email: user.email });
      resp.status(HttpStatus.CREATED).json({ accessToken: accessTokenCreated });
    });
  }

  @Post('reset')
  async reset(req: Request, resp: Response) {
    const { email } = req.body;

    const user = await this.userService.getEmail(email);
    if (!user) {
      resp.status(HttpStatus.BAD_REQUEST).json(`this email: ${email} does not exist in our database`);
      return;
    }
    if (!user.isVerified) {
      resp.status(HttpStatus.FORBIDDEN);
      return;
    }
    const emailTokenCreated = emailToken({ id: user.id, email: user.email });
    sendMail(emailTokenCreated, email);
    resp.status(HttpStatus.OK).json(`we sent you an email to ${email}`);
  }

  @Put('updatepassword')
  @Middleware([resetPasswordLimiter])
  async updatePassword(req: Request, resp: Response) {
    const { token, userPassword } = req.body;
    if (token === null) {
      resp.status(HttpStatus.UNAUTHORIZED);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(userPassword, salt);
    const { EMAIL_SECRET_TOKEN } = process.env;
    jwt.verify(token, EMAIL_SECRET_TOKEN, async (error: any, decoded: any) => {
      if (error) {
        resp.status(HttpStatus.FORBIDDEN).json('token is expired');
        return;
      }

      const user = await this.userService.getUser(decoded.id);
      const validated = await bcrypt.compare(userPassword, user.password);
      if (validated) {
        resp.status(HttpStatus.FORBIDDEN).json('Can not use the same password as previous');
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
      await this.userService.updateUser(decoded.id, payload);
      const accessTokenCreated = accessToken({ id: user.id, email: user.email });
      const refreshTokenCreated = refreshToken({ id: user.id, email: user.email });
      const { password, ...others } = payload;
      resp.status(HttpStatus.OK).json({ others, accessToken: accessTokenCreated, refreshToken: refreshTokenCreated });
    });
  }

  @Get('authorize/:token')
  async authorize(req: Request, resp: Response) {
    const { token } = req.params;
    if (token === null) {
      resp.status(HttpStatus.UNAUTHORIZED);
      return;
    }
    const { EMAIL_SECRET_TOKEN } = process.env;
    jwt.verify(token, EMAIL_SECRET_TOKEN, async (error: any, decoded: any) => {
      if (error) {
        resp.status(HttpStatus.FORBIDDEN).json('token is expired');
        return;
      }
      const user = await this.userService.getUser(decoded.id);
      if (user.isVerified) {
        resp.status(HttpStatus.FORBIDDEN);
        return;
      }
      const payload = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        isVerified: true,
        role: Role.User,
      };
      await this.userService.updateUser(decoded.id, payload);
      const accessTokenCreated = accessToken({ id: user.id, email: user.email });
      const refreshTokenCreated = refreshToken({ id: user.id, email: user.email });
      const { password, ...others } = payload;
      resp.status(HttpStatus.OK).json({ others, accessToken: accessTokenCreated, refreshToken: refreshTokenCreated });
    });
  }
}
