import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { Container } from './container';

dotenv.config();

function handleExit(error: Error | undefined, container: Container): void {
  container.destroy()
    .then(() => {
      if (error) {
        console.error('fatal error 🔥', error);
      } else {
        console.log('terminating ⛔️');
      }
      setTimeout(() => process.exit(error ? 1 : 0), 0);
    })
    .catch((errorOnClose: string) => {
      console.error('error on close 💀', errorOnClose);
      setTimeout(() => process.exit(1), 0);
    });
}

export async function bootstrap(container: Container, port: number): Promise<void> {
  const app = await container.create();

  const server = app.server
    .listen(port, () => {
      console.log(`listening on port ${port} 🚀`);
    })
    .on('error', (error) => handleExit(error, container));

  const shutdownHandler = () => {
    app.close();
    server.close((error) => handleExit(error, container));
  };

  process.once('SIGINT', shutdownHandler);
  process.once('SIGTERM', shutdownHandler);
}