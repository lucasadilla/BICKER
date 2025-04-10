import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable in .env.local');
}

// Use global scope to maintain a cached connection across hot reloads in development.
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    // If a connection is already established, reuse it.
    if (cached.conn) {
        return cached.conn;
    }

    // If no connection promise is set, create one.
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then((mongooseConnection) => mongooseConnection);
    }

    // Await the promise and cache the connection.
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
