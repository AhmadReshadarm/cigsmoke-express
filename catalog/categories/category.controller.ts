import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { CategoryService } from './category.service';
import { Category } from '../../core/entities';
import { ParameterService } from '../parameters/parameter.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isAdmin, verifyToken } from '../../core/middlewares';

@singleton()
@Controller('/categories')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private parameterService: ParameterService,
  ) { }

  @Get()
  @Middleware([verifyToken, isAdmin])
  async getCategories(req: Request, resp: Response) {
    const categories = await this.categoryService.getCategories();

    resp.json(categories);
  }

  @Get('categoriesTree')
  async getCategoriesTree(req: Request, resp: Response) {
    const categories = await this.categoryService.getCategoriesTree()

    resp.json(categories);
  }

  @Get(':id')
  async getCategory(req: Request, resp: Response) {
    const { id } = req.params;
    const category = await this.categoryService.getCategory(id);

    resp.json(category);
  }

  @Post()
  @Middleware([verifyToken, isAdmin])
  async createCategory(req: Request, resp: Response) {
    const { parentId } = req.body
    const newCategory = await validation(new Category(req.body));

    if (parentId) {
      newCategory.parent = await this.categoryService.getCategory(parentId);
    }

    newCategory.parameters = await this.parameterService.getParametersByIds(newCategory.parameters?.map(parameter => String(parameter)))
    const created = await this.categoryService.createCategory(newCategory);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  @Middleware([verifyToken, isAdmin])
  async updateCategory(req: Request, resp: Response) {
    const { id } = req.params;
    const { parentId } = req.body
    const newCategory = await validation(new Category(req.body));

    if (parentId) {
      newCategory.parent = await this.categoryService.getCategory(parentId);
    }

    newCategory.parameters = await this.parameterService.getParametersByIds(newCategory.parameters?.map(parameter => String(parameter)))
    const updated = await this.categoryService.updateCategory(id, newCategory);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async removeCategory(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.categoryService.removeCategory(id);

    resp.status(HttpStatus.OK).json(removed);
  };
}
