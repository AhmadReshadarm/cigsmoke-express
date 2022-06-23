import path from "path";
import "reflect-metadata";

import { bootstrap } from "../core/bootstrap";
import { CatalogApp } from "./catalog.app";
import { CatalogContainer } from "./catalog.container";
import catalogDataSource from './catalog.data-source';


const controllerPaths = path.resolve(__dirname, './load-controllers.js');
const container = new CatalogContainer(controllerPaths);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), CatalogApp, catalogDataSource);
