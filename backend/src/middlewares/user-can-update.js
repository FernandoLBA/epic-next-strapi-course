"use strict";
const _ = require("lodash");

/**
 * Este middleware se creo para que un usuario autenticado
 * solo pueda modificar la data de su mismo usuario y no
 * la de otros.
 *
 * `user-can-update` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    // Crea un log en strapi
    strapi.log.info("In user-can-update middleware.");

    // use lodash pick

    // Si no hay usuario retorna un error de autenticación
    if (!ctx.state?.user) {
      strapi.log.error("You are not authenticated.");
      return ctx.badRequest("You are not authenticated.");
    }

    // Obtiene el id del usuario que desea modificar algún registro y el del 
    // user actual
    const params = ctx.params;
    const requestedUserId = params?.id;
    const currentUserId = ctx.state?.user?.id;

    // Si el usuario que quiere realizar la actualización no tiene id
    if (!requestedUserId) {
      strapi.log.error("Missing user ID.");
      return ctx.badRequest("Missing or invalid user ID.");
    }

    // Si el id del usuario que quiere realizar la actualización no coincide 
    // con el id del usuario actual 
    if (Number(currentUserId) !== Number(requestedUserId)) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }

    // Si el usuario que quiere realizar la actualización y el logueado son iguales
    // Utiliza el lodash y solo permite actualizar las propiedades dentro del array
    ctx.request.body = _.pick(ctx.request.body, [
      "firstName",
      "lastName",
      "bio",
      "image",
    ]);

    await next();
  };
};
