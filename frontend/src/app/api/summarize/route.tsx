import { NextRequest } from "next/server";

/**
 * Este componente recibe una petición (Request) POST.
 * 
 * Se encarga de manejar las respuestas de una petición específica,
 * en este caso de tipo POST, bien sean exitosas o erróneas.
 * 
 * Este route handler maneja peticiones de forma customizada, y todas las
 * peticiones a /api/summarize que sean de tipo POST pasarán por aquí
 * de maner automática.
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
    console.log("FROM OUR ROUTE HANDLER:", req.body);
    try {
        // * Retorna una nueva respuesta con la data, sin error y status 200
        return new Response(
            JSON.stringify({ data: "return from our handler", error: null }),
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error processing request:", error);

        // * SI hay error retorna una nueva respuesta con el error
        if (error instanceof Error)
            return new Response(JSON.stringify({ error: error }));
        return new Response(JSON.stringify({ error: "Unknown error" }));
    }
}