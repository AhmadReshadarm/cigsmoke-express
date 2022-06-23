import path from "path";
import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { UserApp } from "./user.app";
import userDataSource from './user.data-source';

const controllerPaths = path.resolve(__dirname, './load-controllers.js');
const { PORT } = process.env;

bootstrap(Number(PORT ?? 8080), UserApp, controllerPaths, userDataSource);
