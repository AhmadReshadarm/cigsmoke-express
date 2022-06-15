import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { OrderApp } from "./order.app";
import { OrderContainer } from "./order.container";
import { OrderController } from "./order.controller";
import orderDataSource from './order.data-source';

const controllers = [
  OrderController,
];
const container = new OrderContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), OrderApp, orderDataSource);
