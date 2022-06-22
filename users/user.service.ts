import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { User } from '../core/entities/user/user.entity';
import { HttpStatus } from '../core/lib/http-status';

@singleton()
export class UserService {
  private userRepository: Repository<User>;

  constructor(appDataSource: DataSource) {
    this.userRepository = appDataSource.getRepository(User);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserNames(): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('User')
      .select(['User.id', 'User.firstName', 'User.lastName'])
      .getRawMany();
    return users;
  }

  async getUser(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: {
          id: Equal(id),
        },
      });
      return user;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: Equal(email),
        },
      });
      return user;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async createUser(newUser: User): Promise<User> {
    return this.userRepository.save(newUser);
  }

  async updateUser(id: string, userDTO: User) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: {
          id: Equal(id),
        },
      });
      return this.userRepository.update(id, {
        ...user,
        ...userDTO,
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeUser(id: string) {
    try {
      await this.userRepository.findOneOrFail({
        where: {
          id: Equal(id),
        },
      });
      return this.userRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
