// Provide a custom secret for json web token
export const secret = '';

// Mongodb configurations
export const ADDRESS = '';
export const PORT = '';
export const USER = '';
export const PASSWORD = '';

export const bodyParserConfig = {
  multipart: true,
  urlencoded: true,
  parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
  formidable: {
    maxFileSize: 500 * 1024 * 1024, // 5M
  },
};

export const bypassCorsList = [];