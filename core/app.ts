import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { singleton } from 'tsyringe';
import { logger } from './lib/logger';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import './swagger/book.schema';


/**
 @swagger
 components:
 schemas:
 Book:
 type: object
 required:
 - title
 - author
 - finished
 properties:
 id:
 type: integer
 description: The auto-generated id of the book.
 title:
 type: string
 description: The title of your book.
 author:
 type: string
 description: Who wrote the book?
 finished:
 type: boolean
 description: Have you finished reading it?
 createdAt:
 type: string
 format: date
 description: The date of the record creation.
 example:
 title: The Pragmatic Programmer
 author: Andy Hunt / Dave Thomas
 finished: true
 */


@singleton()
export class App {
 static readonly server = express();

  get appServer() {
    return App.server;
  }

  private isKeepAliveDisabled = false;

  constructor() {
    const server = this.appServer;
    const env = server.get('env');

    logger.info(`environment: ${env}`);
    server.use(helmet());
    server.use(
      env === 'production'
        ? morgan('combined', {
            stream: {
              write(message: string): void {
                logger.info(message);
              },
            },
          })
        : morgan('dev'),
    );
    server.use(cors({ exposedHeaders: ['Content-Disposition'] }));
    server.use(json());
    const options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "LogRocket Express API with Swagger",
          version: "0.1.0",
          description:
            "This is a simple CRUD API application made with Express and documented with Swagger",
          license: {
            name: "MIT",
            url: "https://spdx.org/licenses/MIT.html",
          },
          contact: {
            name: "LogRocket",
            url: "https://logrocket.com",
            email: "info@email.com",
          },
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 80}`,
          },
        ],
      },
      apis: ["./swagger/book.schema.ts"],
    };

    const specs = swaggerJsdoc(options);
    server.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(specs)
    );
    server.use(urlencoded({ extended: false }));
    server.use(compression());
    server.use((request, response, next): void => {
      if (this.isKeepAliveDisabled) {
        response.set('Connection', 'close');
      }
      next();
    });
  }

  close(): void {
    this.isKeepAliveDisabled = true;
  }
}
