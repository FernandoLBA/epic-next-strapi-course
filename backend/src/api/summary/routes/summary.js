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
  },
});
