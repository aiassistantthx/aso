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
  // Support both direct JSON and base64-encoded JSON
  let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (serviceAccountBase64) {
    // Decode from base64
    serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  }

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
