// * Librería para crear queries para strapi a través de objetos
import qs from "qs";
import { unstable_noStore as noStore } from "next/cache";

import { flattenAttributes, getStrapiURL } from "@/lib/utils";

// * Obtiene la url base de la app http://localhost:1337
const baseUrl = getStrapiURL();

/**
 * Esta función recibe la url a la cuál se hará fetch
 * @param url 
 * @returns 
 */
async function fetchData(url: string) {
    // ? esta función se usa para que la data no se cachee nunca en el navegador
    noStore();

    const authToken = null; // we will implement this later getAuthToken() later
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
                        fields: ["url", "alternativeText"]
                    },
                    link: {
                        populate: true
                    },
                    feature: {
                        popultae: true
                    }
                }
            }
        }
    })

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
        ]
    })

    return await fetchData(url.href);
}

/**
 * Esta función extrae la metadata contenida en los campos "title" y "description" de la data que viene
 * de strapi, la cuál contiene el nombre de la página y su descripción, y esta data se usa para inyectarla
 * en la metadata de la página correspondiente, de esta forma se inyecta según la página y la url.
 * @returns 
 */
export async function getGlobalMetadata() {
    const url = new URL("/api/global", baseUrl)

    url.search = qs.stringify({
        fields: ["title", "description"]
    })

    return await fetchData(url.href);
}