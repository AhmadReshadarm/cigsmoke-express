import path from "path";
import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { OrderApp } from "./order.app";
import { OrderContainer } from "./order.container";
import orderDataSource from './order.data-source';


const controllerPaths = path.resolve(__dirname, './load-controllers.js');
const container = new OrderContainer(controllerPaths);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), OrderApp, orderDataSource);
