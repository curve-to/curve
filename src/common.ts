import * as moment from 'moment';

/**
 * Get date range
 * @param startDate
 * @param endDate
 */
export const getDateRange = ({
  startDate = '',
  endDate = '',
} = {}): genericObject => {
  // If no startDate is given, initialize it to '1970-01-01'
  if (!startDate && endDate) {
    startDate = '1970-01-01';
  }

  return {
    createdAt: {
      $gte: moment(startDate ? new Date(startDate) : new Date()).format(
        'YYYY-MM-DD 00:00:00'
      ),
      $lte: moment(endDate ? new Date(endDate) : new Date()).format(
        'YYYY-MM-DD 23:59:59'
      ),
    },
  };
};
