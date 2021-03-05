export default {
  port: 1234,
  database: {
    SECRET: '',
    ADDRESS: '',
    PORT: 27017,
    USER: '',
    PASSWORD: '',
  },
  registrationIsOpen: false, // Allow registration
  bodyParserConfig: {
    multipart: true,
    urlencoded: true,
    parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
    formidable: {
      maxFileSize: 500 * 1024 * 1024, // 5M
    },
  },
  bypassCorsList: [], // Whitelist for cors
  tokenExpiration: '90d',
  bannedTables: [], // Here to specify a number of tables that are not allowed to operate
  // WeChat mini program appId, make sure one is saved here before you use signInWithWeChat method
  appIds: {
    wxxxxxxxxxxxxxx: 'xxxxxxxxxxxxxxxxxxxxxxx', // WeChat mini program app secret
  },
};
