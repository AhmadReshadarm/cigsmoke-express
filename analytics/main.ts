import path from "path";
import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { AnalyticsApp } from "./analytics.app";
import orderDataSource from './analytics.data-source';

const controllerPaths = path.resolve(__dirname, './load-controllers.js');
const { PORT } = process.env;

bootstrap(Number(PORT ?? 8080), AnalyticsApp, controllerPaths, orderDataSource);
