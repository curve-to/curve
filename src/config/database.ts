import * as mongoose from 'mongoose';
import config from '../config';

const { ADDRESS, PORT, USER, PASSWORD } = config.database;

const createConn = (db: string) => {
  const url = `mongodb://${USER}:${PASSWORD}@${ADDRESS}:${PORT}/${db}?authSource=admin`;
  return mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const collections = createConn('contentGroup');
export const coreCollections = createConn('core');
