import * as moment from 'moment';

/**
 * Get date range
 * @param dateRange
 */
export const getDateRange = (dateRange = {}): genericObject => {
  const createdAt = Object.keys(dateRange).reduce(
    (final: genericObject, key: string): genericObject => {
      final[key] = moment(new Date(dateRange[key])).unix();
      return final;
    },
    {}
  );

  return { updatedAt: createdAt };
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
