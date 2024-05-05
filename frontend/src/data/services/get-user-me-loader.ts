import qs from "qs";

import { getAuthToken } from "./get-token";
import { getStrapiURL } from "@/lib/utils";

// * Arma una query para strapi
const query = qs.stringify({
    populate: { image: { fields: ["url", "alternativeText"] } },
});

/**
 * Esta función llama a la API de Strapi para saber si el usuario sigue logueado
 * @returns 
 */
export async function getUserMeLoader() {
    // * Obtiene la url
    const baseUrl = getStrapiURL();
    // * Junta la url con el path
    const url = new URL("/api/users/me", baseUrl);
    // * Inyecta las queries al url
    url.search = query;
    
    // * Obtiene el token de sesión
    const authToken = await getAuthToken();

    // * Si no hay token de sesión
    if (!authToken) return { ok: false, data: null, error: null };
    
    // * Si hay token de sesión
    try {
        const response = await fetch(url.href, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            cache: "no-cache",
        });
        const data = await response.json();
        if (data.error) return { ok: false, data: null, error: data.error };
        return { ok: true, data: data, error: null };
    } catch (error) {
        console.log(error);
        return { ok: false, data: null, error: error };
    }
}