/**
 * The DefaultController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/DefaultService');
const login = async (request, response) => {
  try {
    const usuario = await service.login(request.body);
    if (!usuario) {
      response.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      return;
    }

    request.session.regenerate((error) => {
      if (error) {
        response.status(500).json({ message: 'No se pudo iniciar la sesión' });
        return;
      }
      request.session.IdUsuario = usuario.IdUsuario;
      request.session.EsAdmin = usuario.EsAdmin === true;
      request.session.save((saveError) => {
        if (saveError) {
          response.status(500).json({ message: 'No se pudo guardar la sesión' });
          return;
        }
        response.status(200).json(usuario);
      });
    });
  } catch (error) {
    Controller.sendError(response, error);
  }
};

const getSession = async (request, response) => {
  try {
    if (!request.session.IdUsuario) {
      response.status(200).json(null);
      return;
    }
    const usuario = await service.getSessionUser(request.session.IdUsuario);
    response.status(200).json(usuario);
  } catch (error) {
    Controller.sendError(response, error);
  }
};

const logout = (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      response.status(500).json({ message: 'No se pudo cerrar la sesión' });
      return;
    }
    response.clearCookie('connect.sid');
    response.status(204).end();
  });
};

const requireAdmin = (request, response) => {
  if (!request.session.IdUsuario) {
    response.status(401).json({ message: 'Debes iniciar sesión' });
    return false;
  }
  if (request.session.EsAdmin !== true) {
    response.status(403).json({ message: 'Se requieren permisos de administrador' });
    return false;
  }
  return true;
};

const adminOnly = (handler) => async (request, response, next) => {
  if (!requireAdmin(request, response)) return;
  return handler(request, response, next);
};

const requireSession = (request, response) => {
  if (!request.session.IdUsuario) {
    response.status(401).json({ message: 'Debes iniciar sesión' });
    return null;
  }
  return request.session.IdUsuario;
};

const addFichaje = async (request, response) => {
  const idUsuario = requireSession(request, response);
  if (idUsuario === null) return;
  try {
    const resultado = await service.addFichaje(request.body, idUsuario);
    response.status(201).json(resultado);
  } catch (error) {
    Controller.sendError(response, error);
  }
};

const addTrabajo = async (request, response) => {
  await Controller.handleRequest(request, response, service.addTrabajo);
};

const addUsuario = async (request, response) => {
  await Controller.handleRequest(request, response, service.addUsuario);
};

const deleteTrabajo = async (request, response) => {
  await Controller.handleRequest(request, response, service.deleteTrabajo);
};

const deleteUsuario = async (request, response) => {
  await Controller.handleRequest(request, response, service.deleteUsuario);
};

const getApiKeys = async (request, response) => {
  await Controller.handleRequest(request, response, service.getApiKeys);
};

const getFichajeActivo = async (request, response) => {
  const idUsuario = requireSession(request, response);
  if (idUsuario === null) return;
  try {
    const fichaje = await service.getFichajeActivo(idUsuario);
    response.status(200).json(fichaje);
  } catch (error) {
    Controller.sendError(response, error);
  }
};

const getFichajes = async (request, response) => {
  await Controller.handleRequest(request, response, (params) => {
    const finalParams = { ...params };
    // Si hay sesión activa y no se ha especificado explícitamente idUsuario por query (caso AppUsuarios),
    // se restringe la búsqueda a los fichajes del usuario en sesión.
    if (request.session && request.session.IdUsuario && !request.query?.idUsuario) {
      finalParams.idUsuario = request.session.IdUsuario;
    }
    return service.getFichajes(finalParams);
  });
};

const getTrabajoById = async (request, response) => {
  await Controller.handleRequest(request, response, service.getTrabajoById);
};

const getTrabajos = async (request, response) => {
  await Controller.handleRequest(request, response, service.getTrabajos);
};

const getUsuarioById = async (request, response) => {
  await Controller.handleRequest(request, response, service.getUsuarioById);
};

const getUsuarios = async (request, response) => {
  await Controller.handleRequest(request, response, service.getUsuarios);
};

const updateFichaje = async (request, response) => {
  const idUsuario = requireSession(request, response);
  if (idUsuario === null) return;
  const idFichaje = request.openapi.pathParams.id;
  try {
    const resultado = await service.updateFichaje(idFichaje, idUsuario);
    response.status(200).json(resultado);
  } catch (error) {
    Controller.sendError(response, error);
  }
};

const updateTrabajo = async (request, response) => {
  await Controller.handleRequest(request, response, service.updateTrabajo);
};

const updateUsuario = async (request, response) => {
  await Controller.handleRequest(request, response, service.updateUsuario);
};


module.exports = {
  login,
  getSession,
  logout,
  addFichaje,
  addTrabajo: adminOnly(addTrabajo),
  addUsuario: adminOnly(addUsuario),
  deleteTrabajo: adminOnly(deleteTrabajo),
  deleteUsuario: adminOnly(deleteUsuario),
  getApiKeys,
  getFichajeActivo,
  getFichajes,
  getTrabajoById,
  getTrabajos,
  getUsuarioById: adminOnly(getUsuarioById),
  getUsuarios: adminOnly(getUsuarios),
  updateFichaje,
  updateTrabajo: adminOnly(updateTrabajo),
  updateUsuario: adminOnly(updateUsuario),
};
