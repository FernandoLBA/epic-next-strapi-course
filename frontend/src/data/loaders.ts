// * Librería para crear queries para strapi a través de objetos
import qs from "qs";
// * Esta función indica que un componente no es estático y no será guardado en caché
// import { unstable_noStore as noStore } from "next/cache";

import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { getAuthToken } from "./services/get-token";

// * Obtiene la url base de la app http://localhost:1337
const baseUrl = getStrapiURL();

/**
 * Esta función recibe la url a la cuál se hará fetch
 * @param url
 * @returns
 */
async function fetchData(url: string) {
  const authToken = await getAuthToken();

  // ? esta función se usa para que la data no se cachee nunca en el navegador
  // noStore();

  const headers = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await fetch(url, authToken ? headers : {});
    const data = await response.json();

    // * Retorna la data normalizada o aplanada
    return flattenAttributes(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // or return null;
  }
}

/**
 * Esta función trae la data del Hero
 * @returns
 */
export async function getHomePageData() {
  // Construye la url base http://localhost:1337/api/home-page
  const url = new URL("/api/home-page", baseUrl);

  // Inyecta las queries a la url base http://localhost:1337/api/home-page?[...queries]
  url.search = qs.stringify({
    populate: {
      blocks: {
        populate: {
          image: {
            fields: ["url", "alternativeText"],
          },
          link: {
            populate: true,
          },
          feature: {
            popultae: true,
          },
        },
      },
    },
  });

  // Hace fetch de la url enviada y retorna la data
  return await fetchData(url.href);
}

/**
 * Esta función trae la data del navbar (header) y del footer
 * @returns
 */
export async function getGlobalPageData() {
  // * Si queremos que solo esta data sea dinámica y no se cachee usamos noStore aquí:
  // noStore();

  const url = new URL("/api/global", baseUrl);

  url.search = qs.stringify({
    populate: [
      "header.logoText",
      "header.ctaButton",
      "footer.logoText",
      "footer.socialLink",
    ],
  });

  return await fetchData(url.href);
}

/**
 * Esta función extrae la metadata contenida en los campos "title" y "description" de la data que viene
 * de strapi, la cuál contiene el nombre de la página y su descripción, y esta data se usa para inyectarla
 * en la metadata de la página correspondiente, de esta forma se inyecta según la página y la url.
 * @returns
 */
export async function getGlobalMetadata() {
  const url = new URL("/api/global", baseUrl);

  url.search = qs.stringify({
    fields: ["title", "description"],
  });

  return await fetchData(url.href);
}

/**
 * Esta función obtiene los summaries de strapi
 * Recibe un string con el query, para realizar
 * un filtrado ordenado por la fecha createdAt.
 * Y un currentPage de tipo number para el paginado
 * @param queryString
 * @param currentPage
 * @returns
 */
export async function getSummaries(queryString: string, currentPage: number) {
  const PAGE_SIZE = 4;
  const query = qs.stringify({
    // Ordena por la fecha createdAt de forma descendente
    sort: ["createdAt:desc"],
    filters: {
      // O filtra por title o summary que contengan la query (i es no case sensitive)
      $or: [
        { title: { $containsi: queryString } },
        { summary: { $containsi: queryString } },
      ],
    },
    // Enviamos la page y la cantidad de registros por página
    pagination: {
      pageSize: PAGE_SIZE,
      page: currentPage,
    },
  });

  const url = new URL("/api/summaries", baseUrl);
  url.search = query;

  return fetchData(url.href);
}

/**
 * Esta función recibe el id del summary y
 * retorna un summary por su id.
 * @param summaryId
 * @returns
 */
export async function getSummaryById(summaryId: string) {
  return fetchData(`${baseUrl}/api/summaries/${summaryId}`);
}
