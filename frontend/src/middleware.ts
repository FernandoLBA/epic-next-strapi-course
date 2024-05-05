import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getUserMeLoader } from "@/data/services/get-user-me-loader";

/**
 * Este middleware recibe una ruta, por ejemplo "/dashboard",
 * y si el usuario está logueado lo deja pasar a la ruta, sino, lo manda
 * al "/signin".
 * @param request 
 * @returns 
 */
export async function middleware(request: NextRequest) {
    // * Trae la data del usuario logueado desde la cookie
    const user = await getUserMeLoader();
    const currentPath = request.nextUrl.pathname;

    console.log("################### MIDDLEWARE ###################")
    console.log(user);
    console.log(currentPath);
    console.log("################### MIDDLEWARE ###################")

    // * Si la ruta es dashboard y el usuario no está logueado lo retorna al login
    if (currentPath.startsWith("/dashboard") && user.ok === false) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // * Si está logueado lo deja continuar
    return NextResponse.next();
}