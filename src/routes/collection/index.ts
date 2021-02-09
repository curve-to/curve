import {
  create,
  createMany,
  findMany,
  find,
  remove,
  removeMany,
  update,
  updateMany,
  count,
  sum,
} from './controller';
import { requireLogin } from '../../middleware/validate';

const router = Router => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/:collection/count', count) // get count of a collection
    .post('/:collection/sum', sum) // sum total of a specific field of a collection
    .get('/:collection/:documentId', find) // get details of a document
    .put('/:collection/updateMany', requireLogin(), updateMany) // update multiple documents
    .put('/:collection/:documentId', requireLogin(), update) // update a document
    .delete('/:collection/:documentId', requireLogin(), remove) // remove a document
    .delete('/:collection', requireLogin(), removeMany) // remove multiple documents
    .post('/:collection', requireLogin(), create) // create a document
    .post('/:collection/createMany', requireLogin(), createMany) // create multiple documents
    .get('/:collection', findMany); // get documents of a collection

  return router;
};

export default router;
