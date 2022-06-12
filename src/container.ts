import { container } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';
import { DataSource } from 'typeorm';
import { OrderController } from './api/order/order.controller';
import { App } from './app';
import appDataSource from './app-data-source';
import { Controller } from './app.router';
import { logger } from './lib/logger';

const controllers = [
  OrderController,
]

export class Container {
  static async create(): Promise<App> {
    await Promise.all([
      this.initController(),
      this.initDatabase(),
    ]);

    return container.resolve(App);
  }

  static async destroy(): Promise<void> {
    await Promise.all([
      //
      this.closeDatabase(),
    ]);
  }

  private static initController() {
    Array.from<constructor<Controller>>(controllers).map(cls => container.registerType(Controller, cls));
  }

  private static async initDatabase() {
    try {
      await appDataSource.initialize();
      container.registerInstance(DataSource, appDataSource);
      logger.info('Data Source has been initialized!');
      
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
    }
  }

  private static async closeDatabase() {
    await container.resolve(DataSource).destroy();
    logger.info('database connection is closed');
  }
}