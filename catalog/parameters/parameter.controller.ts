import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { ParameterService } from './parameter.service';

@singleton()
export class ParameterController {
  readonly routes = Router();

  constructor(private parameterService: ParameterService) {
    this.routes.get('/parameters', this.getParameters);
    this.routes.get('/parameters/:id', this.getParameter);
    this.routes.post('/parameters', this.createParameter);
    this.routes.put('/parameters/:id', this.updateParameter);
    this.routes.delete('/parameters/:id', this.removeParameter);
  }

  private getParameters = asyncHandler(async (req: Request, resp: Response) => {
    const parameters = await this.parameterService.getParameters();

    resp.json(parameters);
  });

  private getParameter = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const parameter = await this.parameterService.getParameter(id);

    resp.json(parameter);
  });

  private createParameter = asyncHandler(async (req: Request, resp: Response) => {
    const created = await this.parameterService.createParameter(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateParameter = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.parameterService.updateParameter(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeParameter = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.parameterService.removeParameter(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
