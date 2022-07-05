import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Address } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import axios from 'axios';
import { AddressDTO, AddressQueryDTO, UserAuth, UserDTO } from '../order.dtos';
import { Role } from '../../core/enums/roles.enum';
import { scope } from '../../core/middlewares/access.user';

@singleton()
export class AddressService {
  private addressRepository: Repository<Address>;

  constructor(dataSource: DataSource) {
    this.addressRepository = dataSource.getRepository(Address);
  }

  async getAddresses(queryParams: AddressQueryDTO, authToken: string): Promise<AddressDTO[]> {
    const {
      userId,
      firstName,
      lastName,
      address,
      city,
      country,
      zipCode,
      sortBy='userId',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = this.addressRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.checkouts', 'checkout')

    if (userId) { queryBuilder.andWhere('address.userId = :userId', {userId: userId}) }
    if (firstName) { queryBuilder.andWhere('address.firstName = :firstName', {firstName: firstName}) }
    if (lastName) { queryBuilder.andWhere('address.lastName = :lastName', {lastName: lastName}) }
    if (address) { queryBuilder.andWhere('address.address = :address', {address: address}) }
    if (city) { queryBuilder.andWhere('address.city = :city', {city: city}) }
    if (country) { queryBuilder.andWhere('address.country = :country', {country: country}) }
    if (zipCode) { queryBuilder.andWhere('address.zipCode = :zipCode', {zipCode: zipCode}) }

    const addresses = await queryBuilder
      .orderBy(`address.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();

    const result = addresses.map(async (address) => await this.mergeAddress(address, authToken))

    return Promise.all(result)
  }

  async getAddress(id: string, authToken: string): Promise<AddressDTO> {
    const queryBuilder = await this.addressRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.checkouts', 'checkout')
      .where('address.id = :id', {id: id})
      .getOne();

    if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

    return this.mergeAddress(queryBuilder, authToken)
  }

  async getUserById(id: string, authToken: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`, {
        headers: {
          Authorization: authToken!
        }
      });

      return res.data
    } catch (e: any) {
      if (e.name === 'AxiosError' && e.response.status === 403) {
        throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
      }
    }
  }

  async createAddress(newAddress: Address): Promise<Address> {
    return this.addressRepository.save(newAddress);
  }

  async updateAddress(id: string, addressDTO: Address, user: UserAuth) {
    const address = await this.addressRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });
    await this.isUserAddressOwner(address, user)

    return this.addressRepository.save({
      ...address,
      ...addressDTO
    });
  }

  async removeAddress(id: string, user: UserAuth) {
    const address = await this.addressRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    await this.isUserAddressOwner(address, user)

    return this.addressRepository.remove(address);
  }

  isUserAddressOwner(address: Address, user: UserAuth ) {
    if (scope(String(address.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  async mergeAddress(address: Address, authToken: string): Promise<AddressDTO> {

    return {
      id: address.id,
      user: await this.getUserById(address.userId, authToken) ?? address.userId,
      fistName: address.fistName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      country: address.country,
      zipCode: address.zipCode,
      checkouts: address.checkouts
    }
  }
}
