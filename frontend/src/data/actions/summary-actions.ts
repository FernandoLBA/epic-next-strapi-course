"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";

interface Payload {
  data: {
    title?: string;
    videoId: string;
    summary: string;
  };
}

/**
 * Recibe un payload y lo envía mediante un
 * servicio POST, solo si el usuario está
 * autenticado.
 * @param payload
 */
export async function createSummaryAction(payload: Payload) {
  // * Obtiene el token de sesión
  const authToken = await getAuthToken();
  // * Si no hay token retorna un error
  if (!authToken) throw new Error("No auth token found");

  // * Envía el payload
  const data = await mutateData("POST", "/api/summaries", payload);

  // * Aplana o normaliza la data de strapi
  const flattenedData = flattenAttributes(data);

  // * Redirecciona a una pagína con el id del summary como param
  redirect("/dashboard/summaries/" + flattenedData.id);
}
