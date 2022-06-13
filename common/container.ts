import { container } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';
import { DataSource } from 'typeorm';
import { App } from './app';
import appDataSource from './app-data-source';
import { Controller } from './app.router';
import { logger } from './lib/logger';

export class Container {
  controllers: ArrayLike<constructor<Controller>>;
  constructor(controllers: ArrayLike<constructor<Controller>>) {
    this.controllers = controllers;
  }

  async create(): Promise<App> {
    await Promise.all([
      this.initController(),
      this.initDatabase(),
    ]);

    return container.resolve(App);
  }

  async destroy(): Promise<void> {
    await Promise.all([
      this.closeDatabase(),
    ]);
  }

  private initController() {
    Array.from<constructor<Controller>>(this.controllers).map(cls => container.registerType(Controller, cls));
  }

  private async initDatabase() {
    try {
      await appDataSource.initialize();
      container.registerInstance(DataSource, appDataSource);
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