import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { ImageApp } from "./image.app";
import { ImageContainer } from "./image.container";
import { ImageController } from "./image.controller";
import imageDataSource from './image.data-source';

const controllers = [
  ImageController,
];
const container = new ImageContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), ImageApp, imageDataSource);
