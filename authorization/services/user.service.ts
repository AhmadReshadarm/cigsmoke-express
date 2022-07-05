import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { User } from '../../core/entities';
import { Role } from '../../core/enums/roles.enum';
import { UserQueryDTO } from '../auth.dtos';

@singleton()
export class UserService {
  private userRepository: Repository<User>;

  constructor(appDataSource: DataSource) {
    this.userRepository = appDataSource.getRepository(User);
  }

  async getUsers(queryParams: UserQueryDTO): Promise<User[]> {
    const {
      firstName,
      lastName,
      email,
      isVerified,
      role,
      sortBy='email',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = await this.userRepository
      .createQueryBuilder('user')

    if (firstName) { queryBuilder.andWhere('user.firstName LIKE :firstName', { firstName: `%${firstName}%` }); }
    if (lastName) { queryBuilder.andWhere('user.lastName LIKE :lastName', { lastName: `%${lastName}%` }); }
    if (email) { queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` }); }
    if (isVerified) { queryBuilder.andWhere('user.isVerified = :isVerified', { isVerified: isVerified }); }
    if (role) { queryBuilder.andWhere('user.role = :role', { role: role }); }

    return queryBuilder
      .orderBy(`user.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    return user;
  }

  async getEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });

    return user;
  }

  async createUser(newUser: User): Promise<User> {
    return this.userRepository.save(newUser);
  }

  async updateUser(id: string, userDTO: User) {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    const newUser = {
      ...user,
      ...userDTO,
    }
    newUser.isVerified = newUser.isVerified ?? user.isVerified;
    newUser.role = newUser.role ?? user.role;

    return this.userRepository.save(newUser);
  }

  async removeUser(id: string) {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    return this.userRepository.remove(user);
  }
}
