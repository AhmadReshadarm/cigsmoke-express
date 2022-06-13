import "reflect-metadata";
import { bootstrap } from "../common/bootstrap";
import { OrderContainer } from "./order.container";
import { OrderController } from "./order.controller";

const controllers = [
  OrderController,
];
const container = new OrderContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080));