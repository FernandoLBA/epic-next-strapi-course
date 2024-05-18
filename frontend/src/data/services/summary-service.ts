/**
 * Esta función recibe el videoId
 * Y se encarga de hacer una petición POST hacia /api/summarize
 * @param videoId 
 * @returns 
 */
export async function generateSummaryService(videoId: string) {
    // * Impactará a la ruta (route) que está dentro de la carpeta /src/app, /api/summarize/router.tsx
    const url = "/api/summarize";
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({ videoId: videoId }),
        });

        return await response.json();
    } catch (error) {
        console.error("Failed to generate summary:", error);
        if (error instanceof Error) return { error: { message: error.message } };
        return { data: null, error: { message: "Unknown error" } };
    }
}