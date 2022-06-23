import { singleton } from "tsyringe";
import { App } from "../core/app";

@singleton()
export class UserApp extends App {}
