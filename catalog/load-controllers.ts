import { BrandController } from "./brands/brand.controller";
import { CategoryController } from "./categories/category.controller";
import { ColorController } from "./colors/color.controller";
import { ParameterController } from "./parameters/parameter.controller";
import { ProductController } from "./products/product.controller";
import { TagController } from './tags/tag.controller';

const loadControllers = () => {
  return [
    ProductController,
    CategoryController,
    ColorController,
    BrandController,
    ParameterController,
    TagController
  ];
}

export default loadControllers;
