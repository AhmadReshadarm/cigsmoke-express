import { container } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';
import { DataSource } from 'typeorm';
import { App } from './app';
import { Controller } from './app.router';
import { logger } from './lib/logger';

export class Container {
  controllers: ArrayLike<constructor<Controller>>;
  constructor(controllers: ArrayLike<constructor<Controller>>) {
    this.controllers = controllers;
  }

  async create(appClass: any, dataSource: DataSource): Promise<App> {
    await Promise.all([
      this.initController(),
      this.initDatabase(dataSource),
    ]);

    return container.resolve(appClass);
  }

  async destroy(): Promise<void> {
    await Promise.all([
      this.closeDatabase(),
    ]);
  }

  private initController() {
    Array.from<constructor<Controller>>(this.controllers).map(cls => container.registerType(Controller, cls));
  }

  private async initDatabase(dataSource: DataSource) {
    try {
      await dataSource.initialize();
      container.registerInstance(DataSource, dataSource);
      logger.info('Data Source has been initialized!');

    } catch (error) {
      console.error("Error during Data Source initialization:", error);
    }
  }

  private async closeDatabase() {
    await container.resolve(DataSource).destroy();
    logger.info('database connection is closed');
  }
}
