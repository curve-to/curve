import {
  create,
  showDocuments,
  showDocument,
  remove,
  edit,
} from './controller';

const router = (Router) => {
  const router = new Router({ prefix: '/collection' });

  router
    .get('/p/:collection/:documentId', showDocument) // get details of a document
    .put('/:collection/:documentId', edit) // edit a document
    .delete('/:collection/:documentId', remove) // remove a document
    .post('/:collection', create) // create a document
    .get('/p/:collection', showDocuments); // get documents of a collection

  return router;
};

export default router;
