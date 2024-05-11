"use strict";

/**
 * Este middleware se creo con el comando
 * yarn strapi generate
 * y se agregó a la raíz del proyecto, con
 * la intención de que este middleware se
 * pueda aplicar golbalmente.
 * @param {*} config
 * @param {*} param1
 * @returns
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Extrae el id del elemento (por ejemplo del summary) de los params
    const entryId = ctx.params.id;
    // Extrae el user
    const user = ctx.state.user;
    // Extrae el userId
    const userId = user?.id;

    // Si no hay userId retorna un error de autorización
    if (!userId) return ctx.unauthorized(`You can't access this entry`);

    // Extrae el nombre de la api (tabla) donde se use el middleware
    const apiName = ctx.state.route.info.apiName;

    // Genera un appId, por ejemplo: api::summary.summary
    function generateUID(apiName) {
      const apiUid = `api::${apiName}.${apiName}`;
      return apiUid;
    }

    // Crea una appId
    const appUid = generateUID(apiName);

    // Si hay un entryId recibido por params
    if (entryId) {
      // Busca el elemento en el appId y por el id del elemento (entryId)
      const entry = await strapi.entityService.findOne(appUid, entryId, {
        populate: "*",
      });

      // Si hay un entry y su id de usuario no es igual al userId devuelve un error de autorización
      if (entry && entry.user.id !== userId)
        return ctx.unauthorized(`You can't access this entry`);
    }

    // Si no un entryId
    if (!entryId) {
      ctx.query = {
        ...ctx.query,
        // forzamos a que el filter solo traiga la data del usuario logueado
        filters: { ...ctx.query.filters, user: userId },
      };
    }

    await next();
  };
};
