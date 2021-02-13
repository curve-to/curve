import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { collections } from './config/database';

const models = {};

/**
 * Create dynamic models
 * @param collection name of a collection
 * @returns model
 */
export const createDynamicModels = (collection: string) => {
  if (!models[collection]) {
    const schema = new mongoose.Schema(
      { createdAt: Number },
      {
        strict: false,
        versionKey: false,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
      }
    );

    // Generate virtual field 'id' that returns _id.toString()
    schema.virtual('id').get(function () {
      return this._id;
    });

    models[collection] = collections.model(collection, schema, collection);
  }
  return models[collection];
};

/**
 * Get date range
 * @param dateRange
 */
export const getDateRange = (dateRange = {}): genericObject => {
  const createdAt = Object.keys(dateRange).reduce(
    (final: genericObject, key: string): genericObject => {
      const time = dateRange[key];
      // Never convert number to unix timestamp when it is already a number (unix timestamp)
      final[key] =
        typeof time === 'number' ? time : moment(new Date(time)).unix();
      return final;
    },
    {}
  );

  // By default, set createAt to 0 (unix timestamp, 1970-01-01)
  if (!Object.keys(createdAt).length) {
    createdAt['$gte'] = moment(new Date(null)).unix();
  }

  return { createdAt };
};
