import { cookies } from "next/headers";

/**
 * Esta función obtiene el token de sesión de la cookie
 * y lo retorna
 * @returns 
 */
export async function getAuthToken() {
  const authToken = cookies().get("jwt")?.value;
  
  return authToken;
}