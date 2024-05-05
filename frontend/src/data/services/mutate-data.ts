import { getStrapiURL } from "@/lib/utils";
import { getAuthToken } from "./get-token";

/**
 * Esta función se usa para hacer peticiones a una API,
 * recibe el method (GET; POST; PUT; DELETE...)
 * recibe el path "/api/algunPath"
 * y recibe el payload, que será la data a actualziar o guardar.
 * 
 * Retorna la data (como json) que retorne la petición.
 * @param method 
 * @param path 
 * @param payload 
 * @returns 
 */
export async function mutateData(method: string, path: string, payload?: any) {
    // * Obtiene el base url de la api
    const baseUrl = getStrapiURL();
    // * Obtiene el token de sesión
    const authToken = await getAuthToken();
    // * Arma una url con el path que recibe la función
    const url = new URL(path, baseUrl);

    // * Sino hay token devuelve un error
    if (!authToken) throw new Error("No auth token found");

    try {
        // Realiza la request según el method
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ ...payload }),
        });

        const data = await response.json();
        
        return data;
    } catch (error) {
        console.log("error", error);
        throw error;
    }
}