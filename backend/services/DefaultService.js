const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const getUsuarios = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdUsuario, Nombre, Usuario FROM usuarios';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error al consultar usuarios:', err.message);
        return reject({ code: 500, message: 'Error al consultar usuarios' });
      }
      resolve(results);
    });
  });
};

const addUsuario = async (body) => {
  const datos = body && body.body ? body.body : body;
  const Nombre = datos?.Nombre || null;
  const Usuario = datos?.Usuario || null;
  const Clave = datos?.Clave || null;

  if (!Nombre || !Usuario || !Clave) {
    return Promise.reject({
      code: 400,
      message: 'Nombre, Usuario y Clave son obligatorios',
    });
  }

  const claveHash = await bcrypt.hash(Clave, 12);

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO usuarios (Nombre, Usuario, Clave) VALUES (?, ?, ?)';
    db.query(sql, [Nombre, Usuario, claveHash], (err, results) => {
      if (err) {
        console.error('Error al crear usuario:', err.message);
        return reject({ code: 500, message: 'Error al crear usuario' });
      }

      resolve({ IdUsuario: results.insertId, Nombre, Usuario });
    });
  });
};

const login = (credentials) => {
  const { Usuario, Clave } = credentials || {};

  if (!Usuario || !Clave) {
    return Promise.reject({ code: 400, message: 'Usuario y Clave son obligatorios' });
  }

  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdUsuario, Nombre, Usuario, Clave FROM usuarios WHERE Usuario = ?';
    db.query(sql, [Usuario], (err, results) => {
      if (err) {
        console.error('Error al validar las credenciales:', err.message);
        reject({ code: 500, message: 'Error al validar las credenciales' });
        return;
      }

      const usuario = results[0];
      if (!usuario) {
        resolve(null);
        return;
      }

      bcrypt.compare(Clave, usuario.Clave).then((coincide) => {
        if (!coincide) {
          resolve(null);
          return;
        }

        const { IdUsuario, Nombre } = usuario;
        resolve({ IdUsuario, Nombre, Usuario: usuario.Usuario });
      }).catch(reject);
    });
  });
};

const getSessionUser = (idUsuario) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdUsuario, Nombre, Usuario FROM usuarios WHERE IdUsuario = ?';
    db.query(sql, [idUsuario], (err, results) => {
      if (err) {
        console.error('Error al consultar el usuario de sesión:', err.message);
        reject({ code: 500, message: 'Error al consultar la sesión' });
        return;
      }
      resolve(results[0] || null);
    });
  });
};

const getUsuarioById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdUsuario, Nombre, Usuario FROM usuarios WHERE IdUsuario = ?';
    db.query(sql, [id], (err, results) => {
      if (err) return reject({ code: 500, message: 'Error al obtener usuario' });
      if (results.length === 0) return reject({ code: 404, message: 'Usuario no encontrado' });
      resolve(results[0]);
    });
  });
};

const updateUsuario = async (...args) => {
  let idReal = args[0];
  if (typeof idReal === 'object' && idReal !== null) {
    idReal = idReal.idUsuario || idReal.idusuario || idReal.id || idReal.value || Object.values(idReal)[0];
  }

  let datos = {};
  args.forEach((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      if (arg.value && typeof arg.value === 'object') datos = { ...datos, ...arg.value };
      else if (arg.body && typeof arg.body === 'object') datos = { ...datos, ...arg.body };
      else datos = { ...datos, ...arg };
    }
  });

  const Nombre = datos.Nombre || datos.nombre;
  const Usuario = datos.Usuario || datos.usuario;
  const Clave = datos.Clave || datos.clave;

  if (!idReal || isNaN(Number(idReal))) {
    return Promise.reject({ code: 400, message: 'ID de usuario no válido' });
  }

  if (!Nombre || !Usuario) {
    return Promise.reject({ code: 400, message: 'Nombre y Usuario son obligatorios' });
  }

  const claveHash = Clave ? await bcrypt.hash(Clave, 12) : null;

  return new Promise((resolve, reject) => {
    const sql = claveHash
      ? 'UPDATE usuarios SET Nombre = ?, Usuario = ?, Clave = ? WHERE IdUsuario = ?'
      : 'UPDATE usuarios SET Nombre = ?, Usuario = ? WHERE IdUsuario = ?';
    const valores = claveHash
      ? [Nombre, Usuario, claveHash, Number(idReal)]
      : [Nombre, Usuario, Number(idReal)];

    db.query(sql, valores, (err) => {
      if (err) {
        console.error('Error al actualizar usuario:', err.message);
        return reject({ code: 500, message: 'Error al actualizar usuario' });
      }
      resolve({ message: 'Usuario actualizado con éxito' });
    });
  });
};

const deleteUsuario = (id) => {
  return new Promise((resolve, reject) => {
    const idReal = (typeof id === 'object' && id !== null)
      ? (id.id || id.IdUsuario || id.idUsuario || Object.values(id)[0])
      : id;

    const sql = 'DELETE FROM usuarios WHERE IdUsuario = ?';
    db.query(sql, [idReal], (err) => {
      if (err) {
        console.error('Error al eliminar usuario:', err.message);
        return reject({ code: 500, message: 'Error al eliminar usuario' });
      }
      resolve({ message: 'Usuario eliminado correctamente' });
    });
  });
};

const getTrabajos = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdTrabajo, Nombre FROM trabajos';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error al consultar trabajos:', err.message);
        return reject({ code: 500, message: 'Error al consultar trabajos' });
      }
      resolve(results);
    });
  });
};

const addTrabajo = (body) => {
  return new Promise((resolve, reject) => {
    const datos = body && body.body ? body.body : body;
    const Nombre = datos?.Nombre || datos?.nombre || null;

    const sql = 'INSERT INTO trabajos (Nombre) VALUES (?)';
    db.query(sql, [Nombre], (err, results) => {
      if (err) {
        console.error('Error al crear trabajo:', err.message);
        return reject({ code: 500, message: 'Error al crear trabajo' });
      }
      resolve({ IdTrabajo: results.insertId, Nombre });
    });
  });
};

const getTrabajoById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT IdTrabajo, Nombre FROM trabajos WHERE IdTrabajo = ?';
    db.query(sql, [id], (err, results) => {
      if (err) return reject({ code: 500, message: 'Error al obtener trabajo' });
      if (results.length === 0) return reject({ code: 404, message: 'Trabajo no encontrado' });
      resolve(results[0]);
    });
  });
};

const updateTrabajo = (...args) => {
  return new Promise((resolve, reject) => {
    let idReal = args[0];
    if (typeof idReal === 'object' && idReal !== null) {
      idReal = idReal.idTrabajo || idReal.idtrabajo || idReal.id || idReal.value || Object.values(idReal)[0];
    }

    let datos = {};
    args.forEach((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        if (arg.value && typeof arg.value === 'object') datos = { ...datos, ...arg.value };
        else if (arg.body && typeof arg.body === 'object') datos = { ...datos, ...arg.body };
        else datos = { ...datos, ...arg };
      }
    });

    const Nombre = datos.Nombre || datos.nombre;

    if (!idReal || isNaN(Number(idReal))) {
      return reject({ code: 400, message: 'ID de trabajo no válido' });
    }

    if (!Nombre) {
      return reject({ code: 400, message: 'El Nombre del trabajo es obligatorio' });
    }

    const sql = 'UPDATE trabajos SET Nombre = ? WHERE IdTrabajo = ?';
    db.query(sql, [Nombre, Number(idReal)], (err) => {
      if (err) {
        console.error('Error al actualizar trabajo:', err.message);
        return reject({ code: 500, message: 'Error al actualizar trabajo' });
      }
      resolve({ message: 'Trabajo actualizado con éxito' });
    });
  });
};

const deleteTrabajo = (id) => {
  return new Promise((resolve, reject) => {
    const idReal = (typeof id === 'object' && id !== null)
      ? (id.id || id.IdTrabajo || id.idTrabajo || Object.values(id)[0])
      : id;

    const sql = 'DELETE FROM trabajos WHERE IdTrabajo = ?';
    db.query(sql, [idReal], (err) => {
      if (err) {
        console.error('Error al eliminar trabajo:', err.message);
        return reject({ code: 500, message: 'Error al eliminar trabajo' });
      }
      resolve({ message: 'Trabajo eliminado correctamente' });
    });
  });
};

const getFichajes = (...args) => {
  return new Promise((resolve, reject) => {
    let paramsObj = {};
    args.forEach((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        paramsObj = { ...paramsObj, ...arg };
      }
    });

    let idUsr = args[0];
    if (typeof idUsr === 'object' && idUsr !== null) {
      idUsr = idUsr.idUsuario || idUsr.idusuario || idUsr.value || Object.values(idUsr)[0];
    }

    let fInicioRaw = args[1] || paramsObj.fechaInicio || paramsObj.fechainicio || paramsObj.fecha_inicio || paramsObj.FechaInicio;
    if (typeof fInicioRaw === 'object' && fInicioRaw !== null && !(fInicioRaw instanceof Date)) {
      fInicioRaw = fInicioRaw.value || fInicioRaw.fechaInicio || Object.values(fInicioRaw)[0];
    }

    let fFinRaw = args[2] || paramsObj.fechaFin || paramsObj.fechafin || paramsObj.fecha_fin || paramsObj.FechaFin;
    if (typeof fFinRaw === 'object' && fFinRaw !== null && !(fFinRaw instanceof Date)) {
      fFinRaw = fFinRaw.value || fFinRaw.fechaFin || Object.values(fFinRaw)[0];
    }

    const normalizarFecha = (valor) => {
      if (!valor) return null;
      if (valor instanceof Date) {
        const year = valor.getFullYear();
        const month = String(valor.getMonth() + 1).padStart(2, '0');
        const day = String(valor.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      if (typeof valor === 'string' && valor.trim() !== '') {
        return valor.split('T')[0].trim();
      }
      return null;
    };

    const fInicio = normalizarFecha(fInicioRaw);
    const fFin = normalizarFecha(fFinRaw);

    let sql = `
      SELECT f.IdFichaje, f.IdUsuario, f.IdTrabajo, f.FechaHoraEntrada, f.FechaHoraSalida,
             f.HorasTrabajadas, f.GeolocalizacionLatitud, f.GeolocalizacionLongitud,
             u.Nombre AS NombreUsuario, t.Nombre AS NombreTrabajo
      FROM fichajes f
      LEFT JOIN usuarios u ON f.IdUsuario = u.IdUsuario
      LEFT JOIN trabajos t ON f.IdTrabajo = t.IdTrabajo
      WHERE 1=1
    `;
    const params = [];

    if (idUsr !== undefined && idUsr !== null && idUsr !== '' && !isNaN(Number(idUsr))) {
      sql += ' AND f.IdUsuario = ?';
      params.push(Number(idUsr));
    }

    if (fInicio) {
      sql += ' AND DATE(f.FechaHoraEntrada) >= ?';
      params.push(fInicio);
    }

    if (fFin) {
      sql += ' AND DATE(f.FechaHoraEntrada) <= ?';
      params.push(fFin);
    }

    sql += ' ORDER BY f.FechaHoraEntrada DESC';

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error al consultar fichajes:', err.message);
        return reject({ code: 500, message: 'Error al consultar fichajes' });
      }
      resolve(results);
    });
  });
};

const addFichaje = (body, idUsuario) => {
  return new Promise((resolve, reject) => {
    const datos = body && body.body ? body.body : body;
    const { IdTrabajo, GeolocalizacionLatitud, GeolocalizacionLongitud } = datos || {};

    const sql = `
      INSERT INTO fichajes (IdUsuario, IdTrabajo, FechaHoraEntrada, GeolocalizacionLatitud, GeolocalizacionLongitud)
      VALUES (?, ?, NOW(), ?, ?)
    `;
    db.query(sql, [idUsuario, IdTrabajo, GeolocalizacionLatitud || null, GeolocalizacionLongitud || null], (err, results) => {
      if (err) {
        console.error('Error al crear fichaje:', err.message);
        return reject({ code: 500, message: 'Error al crear fichaje' });
      }
      resolve({ IdFichaje: results.insertId, message: 'Fichaje iniciado con éxito' });
    });
  });
};

const getFichajeActivo = (idUsuario) => {
  return new Promise((resolve, reject) => {
    const idReal = (typeof idUsuario === 'object' && idUsuario !== null)
      ? (idUsuario.idUsuario || Object.values(idUsuario)[0])
      : idUsuario;

    const sql = `
      SELECT * FROM fichajes 
      WHERE IdUsuario = ? 
        AND FechaHoraSalida IS NULL 
        AND FechaHoraEntrada >= DATE_SUB(NOW(), INTERVAL 12 HOUR) 
      ORDER BY IdFichaje DESC 
      LIMIT 1
    `;
    db.query(sql, [idReal], (err, results) => {
      if (err) {
        console.error('Error al consultar fichaje activo:', err.message);
        return reject({ code: 500, message: 'Error al consultar fichaje activo' });
      }
      resolve(results[0] || {});
    });
  });
};

const updateFichaje = (id, idUsuario) => {
  return new Promise((resolve, reject) => {
    const idReal = (typeof id === 'object' && id !== null)
      ? (id.id || id.IdFichaje || Object.values(id)[0])
      : id;

    const sql = `
      UPDATE fichajes
      SET FechaHoraSalida = NOW(),
          HorasTrabajadas = TIMESTAMPDIFF(HOUR, FechaHoraEntrada, NOW())
      WHERE IdFichaje = ? AND IdUsuario = ? AND FechaHoraSalida IS NULL
    `;
    db.query(sql, [idReal, idUsuario], (err, results) => {
      if (err) {
        console.error('Error al cerrar fichaje:', err.message);
        return reject({ code: 500, message: 'Error al cerrar fichaje' });
      }
      if (results.affectedRows === 0) {
        return reject({ code: 404, message: 'Fichaje no encontrado o no pertenece al usuario' });
      }
      resolve({ message: 'Fichaje cerrado con éxito' });
    });
  });
};

const getApiKeys = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT idKey, `Key` FROM apikey';
    db.query(sql, (err, results) => {
      if (err) return reject({ code: 500, message: 'Error al obtener ApiKeys' });
      resolve(results);
    });
  });
};

module.exports = {
  login,
  getSessionUser,
  getUsuarios,
  addUsuario,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  getTrabajos,
  addTrabajo,
  getTrabajoById,
  updateTrabajo,
  deleteTrabajo,
  getFichajes,
  addFichaje,
  updateFichaje,
  getFichajeActivo,
  getApiKeys,
};