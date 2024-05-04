import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Esta función recibe una o varias clases de tailwind
 * y las junta con las existentes y las retorna
 * Sirve para inyectar nuevas clases a elementos html o componentes que ya tienen otras clases.
 * @param inputs 
 * @returns 
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza el objeto devuelto por estrapi y le remueve las propiedades data que vienen anidadas
 * @param data 
 * @returns 
 */
export function flattenAttributes(data: any): any {
  // Check if data is a plain object; return as is if not
  if (
    typeof data !== "object" ||
    data === null ||
    data instanceof Date ||
    typeof data === "function"
  ) {
    return data;
  }

  // If data is an array, apply flattenAttributes to each element and return as array
  if (Array.isArray(data)) {
    return data.map((item) => flattenAttributes(item));
  }

  // Initialize an object with an index signature for the flattened structure
  let flattened: { [key: string]: any } = {};

  // Iterate over each key in the object
  for (let key in data) {
    // Skip inherited properties from the prototype chain
    if (!data.hasOwnProperty(key)) continue;

    // If the key is 'attributes' or 'data', and its value is an object, merge their contents
    if (
      (key === "attributes" || key === "data") &&
      typeof data[key] === "object" &&
      !Array.isArray(data[key])
    ) {
      Object.assign(flattened, flattenAttributes(data[key]));
    } else {
      // For other keys, copy the value, applying flattenAttributes if it's an object
      flattened[key] = flattenAttributes(data[key]);
    }
  }

  return flattened;
}

/**
 * obtiene la url de la api 
 * @returns 
 */
export function getStrapiURL() {
  return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

/**
 * Recibe la url de la imagen y la junta con la url de la api
 * y retorna una url completa.
 * @param url 
 * @returns 
 */
export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${getStrapiURL()}${url}`;
}