import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { OrderApp } from "./order.app";
import { OrderContainer } from "./order.container";
import { OrderProductController } from "./orderProducts/orderProduct.controller";
import orderDataSource from './order.data-source';
import { AddressController } from './address/address.controller';
import { BasketController } from './basket/basket.controller';
import { CheckoutController } from './checkout/checkout.controller';

const controllers = [
  OrderProductController,
  AddressController,
  BasketController,
  CheckoutController
];
const container = new OrderContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), OrderApp, orderDataSource);
