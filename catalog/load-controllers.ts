import { CategoryController } from './categories/category.controller';
import { ColorController } from './colors/color.controller';
import { ProductController } from './products/product.controller';
import { TagController } from './tags/tag.controller';
import { ParameterController } from './parameters/parameter.controller';
const loadControllers = () => {
  return [ProductController, CategoryController, ColorController, TagController, ParameterController];
};
export default loadControllers;
