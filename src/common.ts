import * as moment from 'moment';

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

/**
 * parse query for sum method (only)
 * @param query
 */
export const parseQueryForSum = (query = {}): genericObject => {
  const dates = {};
  const _query = Object.keys(query).reduce(
    (final: genericObject, key: string): genericObject => {
      const value = query[key];
      if (key === 'createdAt') {
        for (const dateKey in value) {
          dates[dateKey] = value[dateKey];
        }
      } else if (value['$eq'] != null) {
        final[key] = value['$eq'];
      }

      return final;
    },
    {}
  );

  return {
    dates,
    query: _query,
  };
};
