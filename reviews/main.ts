import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { ReviewApp } from "./review.app";
import { ReviewContainer } from "./review.container";
import { ReviewController } from "./review.controller";
import orderDataSource from './review.data-source';

const controllers = [
  ReviewController,
];
const container = new ReviewContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), ReviewApp, orderDataSource);
