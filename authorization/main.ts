import 'reflect-metadata';
import { bootstrap } from '../core/bootstrap';
import { AuthApp } from './auth.app';
import { AuthContainer } from './auth.container';
import { AuthController } from './auth.controller';

const controllers = [AuthController];
const container = new AuthContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), AuthApp);
