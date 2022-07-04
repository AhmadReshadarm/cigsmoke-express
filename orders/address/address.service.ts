import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Address } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import axios from 'axios';
import { AddressDTO, AddressQueryDTO , UserDTO } from '../order.dtos';

@singleton()
export class AddressService {
  private addressRepository: Repository<Address>;

  constructor(dataSource: DataSource) {
    this.addressRepository = dataSource.getRepository(Address);
  }

  async getAddresses(queryParams: AddressQueryDTO): Promise<AddressDTO[]> {
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

    const result = addresses.map(async (address) => await this.mergeAddress(address))

    return Promise.all(result)
  }

  async getAddress(id: string): Promise<AddressDTO> {
    const queryBuilder = await this.addressRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.checkouts', 'checkout')
      .where('address.id = :id', {id: id})
      .getOne();

    if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

    return this.mergeAddress(queryBuilder)
  }

  async getUsersById(id: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`);

      return res.data;
    } catch (e) {
      console.error(e)
      throw new CustomExternalError([ErrorCode.USER_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async createAddress(newAddress: Address): Promise<Address> {
    await this.getUsersById(newAddress.userId);

    return this.addressRepository.save(newAddress);
  }

  async updateAddress(id: string, addressDTO: Address) {
    try {
      const address = await this.addressRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      await this.getUsersById(addressDTO.userId);

      return this.addressRepository.save({
        ...address,
        ...addressDTO
      });
    } catch (e) {
      if (e instanceof CustomExternalError) {
        throw new CustomExternalError(e.messages, e.statusCode)
      }
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeAddress(id: string) {
    try {
      await this.addressRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.addressRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async mergeAddress(address: Address): Promise<AddressDTO> {

    return {
      id: address.id,
      user: await this.getUsersById(address.userId),
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
