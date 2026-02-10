import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import admin from 'firebase-admin';

declare module 'fastify' {
  interface FastifyInstance {
    firebase: admin.app.App;
    firebaseAuth: admin.auth.Auth;
  }
}

async function firebasePlugin(fastify: FastifyInstance) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    fastify.log.warn('FIREBASE_SERVICE_ACCOUNT not set - Firebase Auth disabled');
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    fastify.decorate('firebase', app);
    fastify.decorate('firebaseAuth', app.auth());

    fastify.log.info('Firebase Admin SDK initialized');
  } catch (error) {
    fastify.log.error({ err: error }, 'Failed to initialize Firebase Admin SDK');
  }
}

export default fp(firebasePlugin, { name: 'firebase-plugin' });
