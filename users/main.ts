import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { UserApp } from "./user.app";
import { UserContainer } from "./user.container";
import { UserController } from "./user.controller";
import userDataSource from './user.data-source';

const controllers = [
  UserController,
];
const container = new UserContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), UserApp, userDataSource);
