import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { CategoryService } from './category.service';
import { Category } from '../../core/entities';
import { ParameterService } from '../parameters/parameter.service';

@singleton()
export class CategoryController {
  readonly routes = Router();

  constructor(
    private categoryService: CategoryService,
    private parameterService: ParameterService,
    ) {
    this.routes.get('/categories', this.getCategories);
    this.routes.get('/categories/:id', this.getCategory);
    this.routes.get('/categoriesTree', this.getCategoriesTree)
    this.routes.post('/categories', this.createCategory);
    this.routes.put('/categories/:id', this.updateCategory);
    this.routes.delete('/categories/:id', this.removeCategory);
  }

  private getCategories = asyncHandler(async (req: Request, resp: Response) => {
    const categories = await this.categoryService.getCategories();

    resp.json(categories);
  });

  private getCategory = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const category = await this.categoryService.getCategory(id);

    resp.json(category);
  });

  private getCategoriesTree = asyncHandler(async (req: Request, resp: Response) => {
    const categories = await this.categoryService.getCategoriesTree()

    resp.json(categories);
  })

  private createCategory = asyncHandler(async (req: Request, resp: Response) => {
    const { parentId } = req.body
    const newCategory = await validation(new Category(req.body));

    parentId ? newCategory.parent = await this.categoryService.getCategory(parentId) : null;
    newCategory.parameters = await this.parameterService.getParametersByIds(newCategory.parameters.map(parameter => String(parameter)))
    const created = await this.categoryService.createCategory(newCategory);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateCategory = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const { parentId } = req.body
    const newCategory = await validation(new Category(req.body));

    parentId ? newCategory.parent = await this.categoryService.getCategory(parentId) : null;
    newCategory.parameters = await this.parameterService.getParametersByIds(newCategory.parameters.map(parameter => String(parameter)))
    const updated = await this.categoryService.updateCategory(id, newCategory);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeCategory = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.categoryService.removeCategory(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
