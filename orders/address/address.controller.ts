import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { Address } from '../../core/entities';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { AddressService } from './address.service';

@singleton()
export class AddressController {
  readonly routes = Router();

  constructor(private addressService: AddressService) {
    this.routes.get('/addresses', this.getAddresses);
    this.routes.get('/addresses/:id', this.getAddress);
    this.routes.post('/addresses', this.createAddress);
    this.routes.put('/addresses/:id', this.updateAddress);
    this.routes.delete('/addresses/:id', this.removeAddress);
  }

  private getAddresses = asyncHandler(async (req: Request, resp: Response) => {
    const addresses = await this.addressService.getAddresses(req.query);

    resp.json(addresses);
  });

  private getAddress = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const address = await this.addressService.getAddress(id);

    resp.json(address);
  });

  private createAddress = asyncHandler(async (req: Request, resp: Response) => {
    const newAddress = await validation(new Address(req.body));
    const created = await this.addressService.createAddress(newAddress);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateAddress = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.addressService.updateAddress(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeAddress = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.addressService.removeAddress(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
