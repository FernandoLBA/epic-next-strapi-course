"use strict";

/**
 * summary router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

// * Agregamos como segun argumento el middleware creado en summaries
module.exports = createCoreRouter("api::summary.summary", {
  // * Pasamos la configuración
  config: {
    // * Al momento de crear ejecuta el middleware on-summary-create
    create: {
      middlewares: ["api::summary.on-summary-create"],
    },
    // Se agrega el middleware de acuerdo al tipo de método
    find: {
      /* 
        Este middleware se creó en la raíz del proyecto y 
        como se usa dentro de summary, automáticamente le envía 
        el nombre de la api (tabla) summary y para que reciba el id
        del user, debemos activar en strapi en Roles, Authenticatd
        Users-permissions los métodos de user "find y findOne"
      */
      middlewares: ["global::is-owner"],
    },
    findOne: {
      middlewares: ["global::is-owner"],
    },
    update: {
      middlewares: ["global::is-owner"],
    },
    delete: {
      middlewares: ["global::is-owner"],
    },
  },
});
