"use server";

import { z } from "zod";
import qs from "qs";

import { getUserMeLoader } from "../services/get-user-me-loader";
import { mutateData } from "../services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import {
    fileDeleteService,
    fileUploadService,
} from "@/data/services/file-service";

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

// * Tamaño máximo del archivo (imagen)
const MAX_FILE_SIZE = 5000000;

// * Tipos de imagen aceptados
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

// VALIDATE IMAGE WITH ZOD 
const imageSchema = z.object({
    image: z
        .any()
        .refine((file) => {
            if (file.size === 0 || file.name === undefined) return false;
            else return true;
        }, "Please update or add new image.")

        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        )
        .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`),
});

export async function uploadProfileImageAction(
    imageId: string,
    prevState: any,
    formData: FormData
) {

    // GET THE LOGGED IN USER
    const user = await getUserMeLoader();
    if (!user.ok) throw new Error("You are not authorized to perform this action.");

    const userId = user.data.id;

    // CONVERT FORM DATA TO OBJECT
    const data = Object.fromEntries(formData);

    // VALIDATE THE IMAGE
    const validatedFields = imageSchema.safeParse({
        image: data.image,
    });

    if (!validatedFields.success) {
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            strapiErrors: null,
            data: null,
            message: "Invalid Image",
        };
    }

    // DELETE PREVIOUS IMAGE IF EXISTS
    if (imageId) {
        try {
            await fileDeleteService(imageId);
        } catch (error) {
            return {
                ...prevState,
                strapiErrors: null,
                zodErrors: null,
                message: "Failed to Delete Previous Image.",
            };
        }
    }


    // UPLOAD NEW IMAGE TO MEDIA LIBRARY
    const fileUploadResponse = await fileUploadService(data.image);

    if (!fileUploadResponse) {
        return {
            ...prevState,
            strapiErrors: null,
            zodErrors: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (fileUploadResponse.error) {
        return {
            ...prevState,
            strapiErrors: fileUploadResponse.error,
            zodErrors: null,
            message: "Failed to Upload File.",
        };
    }
    const updatedImageId = fileUploadResponse[0].id;
    const payload = { image: updatedImageId };

    // UPDATE USER PROFILE WITH NEW IMAGE
    const updateImageResponse = await mutateData(
        "PUT",
        `/api/users/${userId}`,
        payload
    );
    const flattenedData = flattenAttributes(updateImageResponse);

    return {
        ...prevState,
        data: flattenedData,
        zodErrors: null,
        strapiErrors: null,
        message: "Image Uploaded",
    };
}