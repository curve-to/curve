import * as upyun from '../../lib/upyun';
import config from '../../config';

const service = new upyun.Service(
  config.upyunConfig.service,
  config.upyunConfig.operator,
  config.upyunConfig.password
);

export default new upyun.Client(service);
