import { Controller, Delete, Get, Post, Put } from '../../core/decorators';
import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Address } from '../../core/entities';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { AddressService } from './address.service';

@singleton()
@Controller('/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  async getAddresses(req: Request, resp: Response) {
    const addresses = await this.addressService.getAddresses(req.query);

    resp.json(addresses);
  }

  @Get(':id')
  async getAddress(req: Request, resp: Response) {
    const { id } = req.params;
    const address = await this.addressService.getAddress(id);

    resp.json(address);
  }

  @Post()
  async createAddress(req: Request, resp: Response) {
    const newAddress = await validation(new Address(req.body));
    const created = await this.addressService.createAddress(newAddress);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateAddress(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.addressService.updateAddress(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeAddress(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.addressService.removeAddress(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
