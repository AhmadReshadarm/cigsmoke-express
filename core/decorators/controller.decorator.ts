import { HttpMethods, ControllerDecoratorParams } from "../enums";
import { RequestHandler } from "express";
import { Order } from "../entities";
import { container, inject } from 'tsyringe';

export function Controller(path: string): Function {
    return function(target: any): void {
        const router = target.routes;

        for (const _action in target.prototype) {
            if (target.prototype.hasOwnProperty(_action)) {
                const _path: string = Reflect.getMetadata(ControllerDecoratorParams.Path, target.prototype, _action) || '';
                const method: HttpMethods = Reflect.getMetadata(ControllerDecoratorParams.Method, target.prototype, _action);
                const middlewares: RequestHandler[] = Reflect.getMetadata(ControllerDecoratorParams.Middleware, target.prototype, _action) || [];

                setTimeout(() => {
                    const targetObject = container.resolve(target);
                    router[method](`${path}/${_path}`, middlewares, (target.prototype as any)[_action].bind(targetObject));
                });
            }
        }
    }
}
