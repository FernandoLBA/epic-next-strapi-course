"use server";

// * Librería para validar formularios
import { z } from "zod";
// * Para manejar las cookies
import { cookies } from "next/headers";
// * Para redireccionar a una ruta
import { redirect } from "next/navigation";

import { registerUserService } from "../services/auth-service";

// * Configuración de cookies
const config = {
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
}

// * Esquema de validación de formulario con Zod
const schemaRegister = z.object({
    username: z.string().min(3).max(20, {
        message: "Username must be between 3 and 20 characters",
    }),
    password: z.string().min(6).max(100, {
        message: "Password must be between 6 and 100 characters",
    }),
    email: z.string().email({
        message: "Please enter a valid email address",
    }),
});

/**
 * Esta función recibe un estado previo (estado incial o un estado previo con datos)
 * recibe la data del formulario y los retorna
 * @param prevState 
 * @param formData 
 * @returns 
 */
export async function registerUserAction(prevState: any, formData: FormData) {
    // * Usa el schema de validación para validar la data del formulario
    const validatedFields = schemaRegister.safeParse({
        // * Extrae la data de cada campo
        username: formData.get("username"),
        password: formData.get("password"),
        email: formData.get("email"),
    })

    // * Si no pasa la validación
    if (!validatedFields.success) {
        return {
            // * estado previo
            ...prevState,
            // * errores de zod aplanados
            zodErrors: validatedFields.error.flatten().fieldErrors,
            // * errores de strapi
            strapiErrors: null,
            // * Mnesaje de error
            message: "Missing Fields. Failed to register.",
        }
    }

    // * Envía la data validad a registrarse
    const responseData = await registerUserService(validatedFields.data);

    //  * Si no hubo respuesta
    if (!responseData) {
        return {
            ...prevState,
            strapiErrors: null,
            zodErrors: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    //  * Si la respuesta tiene un error
    if (responseData.error) {
        return {
            ...prevState,
            strapiErrors: responseData.error,
            zodErrors: null,
            message: "Failed to Register.",
        };
    }

    // * Le añadimos el token de strapi a la cookie y la configuración de la cookie.
    cookies().set("jwt", responseData.jwt, config);

    // * Una vez que pasa la validación, el registro y se guarda la cookie de sesión, redirecciona al dashboard
    redirect("/dashboard");
}