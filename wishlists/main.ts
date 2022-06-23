import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { WishlistApp } from "./wishlist.app";
import { WishlistContainer } from "./wishlist.container";
import { WishlistController } from "./wishlist.controller";
import orderDataSource from './wishlist.data-source';

const controllers = [
  WishlistController,
];
const container = new WishlistContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), WishlistApp, orderDataSource);
