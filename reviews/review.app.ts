import { singleton } from "tsyringe";
import { App } from "../core/app";
import { AppRouter } from "../core/app.router";

@singleton()
export class ReviewApp extends App {
  constructor(router: AppRouter){
    super(router);
  }
}
