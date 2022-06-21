import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { User } from '../core/entities/user/user.entity';
import { asyncHandler } from '../core/lib/error.handlers';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { UserService } from './user.service';

@singleton()
export class UserController {
  readonly routes = Router();

  constructor(private userService: UserService) {
    this.routes.get('/users', this.getUsers);
    this.routes.get('/users/:id', this.getUser);
    this.routes.post('/users', this.createUser);
    this.routes.put('/users/:id', this.updateUser);
    this.routes.delete('/users/:id', this.removeUser);
  }

  private getUsers = asyncHandler(async (req: Request, resp: Response) => {
    const users = await this.userService.getUsers();

    resp.json(users);
  });

  private getUser = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const user = await this.userService.getUser(id);

    resp.json(user);
  });

  private createUser = asyncHandler(async (req: Request, resp: Response) => {
    const newUser = await validation(new User(req.body));
    const created = await this.userService.createUser(newUser);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateUser = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.userService.updateUser(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeUser = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.userService.removeUser(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
