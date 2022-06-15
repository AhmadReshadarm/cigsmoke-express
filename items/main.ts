import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { ItemApp } from "./item.app";
import { ItemContainer } from "./item.container";
import { ItemController } from "./item.controller";

const controllers = [
  ItemController,
];
const container = new ItemContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), ItemApp);
