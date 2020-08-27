import * as mongoose from 'mongoose';
import { ADDRESS, PORT, USER, PASSWORD } from '../config';

const createConn = (db: string) => {
  const url = `mongodb://${USER}:${PASSWORD}@${ADDRESS}:${PORT}/${db}?authSource=admin`;
  return mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const user = createConn('user');
export const collections = createConn('contentGroup');
