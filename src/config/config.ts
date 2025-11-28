import {config as conf} from 'dotenv'
conf();

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
};

export const config = Object.freeze(_config);

// Object.freeze() is used to make an object completely immutable.
// In simple words: After you freeze an object, no one can change, delete, or add properties.