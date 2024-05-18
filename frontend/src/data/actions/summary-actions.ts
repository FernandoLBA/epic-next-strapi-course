"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";

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

  if (flattenedData.error) throw new Error(flattenedData.error.message);

  // * Redirecciona a una pagína con el id del summary como param
  redirect("/dashboard/summaries/" + flattenedData.id);
}

/**
 * Recibe el estado previo, y el formData
 * Y actualiza el summary según su id con
 * la data recibida.
 * @param prevState
 * @param formData
 * @returns
 */
export async function updateSummaryAction(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData);
  const id = rawFormData.id as string;

  const payload = {
    data: {
      title: rawFormData.title,
      summary: rawFormData.summary,
    },
  };

  const responseData = await mutateData("PUT", `/api/summaries/${id}`, payload);

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to update summary.",
    };
  }

  const flattenedData = flattenAttributes(responseData);

  // * Se usa para refrescar la información de esa ruta una vez que cambie
  revalidatePath("/dashboard/summaries");

  return {
    ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
}

/**
 * Recibe el id del summary y el estado previo,
 * borra el summary de acuerdo a su id.
 * @param id
 * @param prevState
 * @returns
 */
export async function deleteSummaryAction(id: string, prevState: any) {
  const responseData = await mutateData("DELETE", `/api/summaries/${id}`);

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to delete summary.",
    };
  }

  redirect("/dashboard/summaries");
}
