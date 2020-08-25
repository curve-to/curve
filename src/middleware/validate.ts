/**
 * Validate fields of a specific route
 * @param fields fields required by the route
 */
const validate = (fields: string[]) => {
  return async (ctx, next) => {
    if (!fields.length) return await next();

    const { method, query, body } = ctx.request;
    const source = method.toUpperCase() === 'GET' ? query : body;
    const params = Object.keys(source); // params provided by requests

    for (const field of fields) {
      if (!!field && !params.includes(field)) {
        return ctx.throw(400, `required field ${field} is not provided`);
      }
    }

    return await next();
  };
};

export default validate;
