/**
 * Este componente recibe un array de errores tipo string
 * y si no hay errores retorna null, caso contrario
 * retorna un div por cada error.
 * @param param0 
 * @returns 
 */
export function ZodErrors({ error }: { error: string[] }) {
    if (!error) return null;
    
    return error.map((err: string, index: number) => (
        <div key={index} className="text-pink-500 text-xs italic mt-1 py-2">
            {err}
        </div>
    ));
}