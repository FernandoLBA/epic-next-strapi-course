"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {
    // Obtiene todas las rutas de users-permissions
    const userRoutes =
      strapi.plugins["users-permissions"].routes["content-api"].routes;

    // Guardamos el middleware user-find-many que queremos usar
    const isUserOwnerMiddleware = "global::user-find-many";
    // Agregamos otro
    const isUserCanUpdateMiddleware = "global::user-can-update";

    // Mapea las rutas y busca el indice de la ruta dónde queremos aplicar el middleware
    const findUser = userRoutes.findIndex(
      // Recibe una ruta, y si coincide con el nombre y el método devuelve su posición
      (route) => route.handler === "user.find" && route.method === "GET"
    );

    const updateUser = userRoutes.findIndex(
      // Recibe una ruta, y si coincide con el nombre y el método devuelve su posición
      (route) => route.handler === "user.update" && route.method === "PUT"
    );

    /**
     * Esta función setea los middlewares y las policies si existen,
     * sino hay nada, agrega un array vacío.
     *
     * Recibe el array de rutas y la posición de la ruta que usaremos
     * @param {*} routes
     * @param {*} index
     */
    function initializeRoute(routes, index) {
      routes[index].config.middlewares = routes[index].config.middlewares || [];
      routes[index].config.policies = routes[index].config.policies || [];
    }

    // Si encuentra el index
    if (findUser) {
      // Setea los middlewares y policies a la ruta
      initializeRoute(userRoutes, findUser);
      // Agrega el middleware que usaremos a la ruta
      userRoutes[findUser].config.middlewares.push(isUserOwnerMiddleware);
    }

    if (updateUser) {
      // Setea los middlewares y policies a la ruta
      initializeRoute(userRoutes, updateUser);
      // Agrega el middleware que usaremos a la ruta
      userRoutes[updateUser].config.middlewares.push(isUserCanUpdateMiddleware);
    }

    console.log(userRoutes[updateUser]);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
