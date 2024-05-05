"use server";
import qs from "qs";
import { mutateData } from "../services/mutate-data";
import { flattenAttributes } from "@/lib/utils";

export async function updateProfileAction(
    // * este id se recibe mediante el bind, otra manera de pasar el id hasta esta action
    userId: string,
    prevState: any,
    formData: FormData
) {
    // * Convierte el formData en un objeto con clave valor por cada campo del form
    const rawFormData = Object.fromEntries(formData);

    const query = qs.stringify({
        populate: "*",
    });

    // * Arma el payload con la data del formulario
    const payload = {
        firstName: rawFormData.firstName,
        lastName: rawFormData.lastName,
        bio: rawFormData.bio,
        // * Este id se recibe del input oculto en el formulario
        // id: rawFormData.id,
    };

    // * Mandamos el método, el enpoint y el payload para actualizar los datos del usuario según su id
    const responseData = await mutateData(
        "PUT",
        `/api/users/${userId}?${query}`,
        payload
    )

    // * Si no hubo respuesta
    if (!responseData) {
        return {
            ...prevState,
            strapiErrors: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    // * Si hubo un error en la respuesta
    if (responseData.error) {
        return {
            ...prevState,
            strapiErrors: responseData.error,
            message: "Failed to Register.",
        };
    }

    // * Aplana o normaliza la data obtenida de strapi
    const flattenedData = flattenAttributes(responseData);

    return {
        ...prevState,
        message: "Profile Updated",
        data: flattenedData,
        strapiErrors: null,
    };
}