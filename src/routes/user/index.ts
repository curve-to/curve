import { login, register, changePassword } from './controller';
import { validate } from '../../middleware/validate';

const router = (Router) => {
  const router = new Router({ prefix: '/user' });

  router
    .post('/login', validate(['username', 'password']), login)
    .post('/register', validate(['username', 'password', 'email']), register)
    .put(
      '/change',
      validate(['username', 'password', 'email']),
      changePassword
    );

  return router;
};

export default router;
