import "reflect-metadata";
import { bootstrap } from "../core/bootstrap";
import { CatalogApp } from "./catalog.app";
import { CatalogContainer } from "./catalog.container";
import { ProductController } from './products/product.controller';
import { CategoryController } from './categories/category.controller';
import { ColorController } from './colors/color.controller';
import { BrandController } from './brands/brand.controller';
import catalogDataSource from './catalog.data-source';
import { ParameterController } from './parameters/parameter.controller';

const controllers = [
  ProductController,
  CategoryController,
  ColorController,
  BrandController,
  ParameterController
];
const container = new CatalogContainer(controllers);
const { PORT } = process.env;

bootstrap(container, Number(PORT ?? 8080), CatalogApp, catalogDataSource);
