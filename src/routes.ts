import Router from 'koa-router'
import { requestLogger } from './middlewares/requestLogger'
import { responseBuilder } from './middlewares/responseBuilder'
import ContactController from './controllers/ContactController'


const apiRouter = new Router({ prefix: '/api' })

apiRouter.use(responseBuilder)
apiRouter.use(requestLogger)

/**
 * GET /api/contacts - получение списка контактов
 * GET /api/contacts/1 - получение определенного контакта по его идентификатору
 * POST /api/contacts - создание нового контакта (name, surname, post)
 * PUT /api/contacts/:cid - редактирование существующего контакта
 */

apiRouter.get('/contacts',ContactController.index);

apiRouter.get('/contacts/:id', ContactController.show ); 

apiRouter.post('/contacts', ContactController.create ); 

apiRouter.put('/contacts/:id', ContactController.update );

apiRouter.delete('/contacts/:id', ContactController.delete ); 


export default [apiRouter]