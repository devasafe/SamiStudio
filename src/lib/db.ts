import mongoose from "mongoose";
import { ApiError } from "@/lib/api/errors";

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache global para sobreviver ao hot reload do Next em desenvolvimento.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalWithMongoose.mongooseCache ?? {
  connection: null,
  promise: null,
};
globalWithMongoose.mongooseCache = cache;

/** Conexão única com o MongoDB Atlas (Docs/10). */
export async function connectDb(): Promise<typeof mongoose> {
  if (cache.connection) {
    return cache.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new ApiError(503, "Banco de dados não configurado (MONGODB_URI ausente).");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.connection;
}
