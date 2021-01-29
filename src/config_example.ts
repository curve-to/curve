export default {
  database: {
    SECRET: '',
    ADDRESS: '',
    PORT: 27017,
    USER: '',
    PASSWORD: '',
  },
  allowRegister: false, // allow registration
  bodyParserConfig: {
    multipart: true,
    urlencoded: true,
    parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
    formidable: {
      maxFileSize: 500 * 1024 * 1024, // 5M
    },
  },
  bypassCorsList: [], // whitelist for cors
  tokenExpiration: '90d',
  appId: '', // WeChat mini program appId
  appSecret: '', // WeChat mini program app secret
};
