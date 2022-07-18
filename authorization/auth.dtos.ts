import { Role } from '../core/enums/roles.enum';

export interface UserQueryDTO {
  readonly firstName?: string,
  readonly lastName?: string,
  readonly email?: string,
  readonly isVerified?: boolean,
  readonly role?: Role,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}

export interface IUser {
  readonly id: string,
  readonly firstName: string,
  readonly lastName: string,
  readonly email: string,
  readonly isVerified: boolean,
  readonly role: Role,
}
