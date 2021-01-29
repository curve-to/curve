export default {
  database: {
    SECRET: '',
    ADDRESS: '',
    PORT: 27017,
    USER: '',
    PASSWORD: '',
  },
  registrationIsOpen: false, // allow registration
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
	// WeChat mini program appId, make sure one is saved here before you use signInWithWeChat method
	appIds: {
		wxxxxxxxxxxxxxx: 'xxxxxxxxxxxxxxxxxxxxxxx', // WeChat mini program app secret
	},
};
