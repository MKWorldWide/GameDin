import 'dotenv/config';
import { createServer } from './server';
import { appConfig } from './config/app.config';

// Start the server
async function start() {
  try {
    const server = await createServer({
      logger: {
        level: appConfig.LOG_LEVEL,
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
    });

    await server.ready();
    
    await server.listen({
      port: appConfig.PORT,
      host: appConfig.HOST,
    });

    console.log(`\n🚀 Server is running on http://${appConfig.HOST}:${appConfig.PORT}${appConfig.API_PREFIX}`);
    console.log(`\n📚 API Documentation available at http://${appConfig.HOST}:${appConfig.PORT}${appConfig.API_PREFIX}/documentation\n`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the application
start();
