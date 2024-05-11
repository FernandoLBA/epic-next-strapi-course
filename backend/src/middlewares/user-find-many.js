"use strict";

/**
 * Este middleware evita que un usuario logueado acceda a información
 * de otros usuarios, solo permite acceder a la información del usuario
 * logueado.
 * 
 * `user-find-many-owner` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    // Creo que agrega un log a strapi
    strapi.log.info("In user-find-many-owner middleware.");

    // Extrae el id del user
    const currentUserId = ctx.state?.user?.id;

    // Si no hay un id de user
    if (!currentUserId) {
      // Retorna un bad request
      strapi.log.error("You are not authenticated.");
      return ctx.badRequest("You are not authenticated.");
    }

    ctx.query = {
      ...ctx.query,
      // forzamos a que el filter solo traiga la data del usuario logueado
      filters: { ...ctx.query.filters, id: currentUserId },
    };

    await next();
  };
};