"use strict";

 
/**
 * Este middleware fue creado con el comando
 * yarn strapi generate
 * 
 * @param {*} config 
 * @param {*} param1 
 * @returns 
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // * Extrae el user
    const user = ctx.state.user;

    // * Si no hay user devuelve un error de autenticación
    if (!user) return ctx.unauthorized("You are not authenticated");

    // * Extrae los créditos del user
    const availableCredits = user.credits;
    
    // * Si el user no tiene créditos devuelve un error
    if (availableCredits === 0)
      return ctx.unauthorized("You do not have enough credits.");

    // * Si todo sale bien avanza
    await next();

    // update the user's credits
    const uid = "plugin::users-permissions.user";
    const payload = {
      data: {
        credits: availableCredits - 1,
        // * Conecta el user con summary en strapi
        summaries: {
          connect: [ctx.response.body.data.id],
        },
      },
    };

    try {
      await strapi.entityService.update(uid, user.id, payload);
    } catch (error) {
      ctx.badRequest("Error Updating User Credits");
    }

    console.log("############ Inside middleware end #############");
  };
};