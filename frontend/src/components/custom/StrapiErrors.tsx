interface StrapiErrorsProps {
    message: string | null;
    name: string;
    status: string | null;
}

/**
 * Este componente recibe un error de strapi
 * y lo retorna dentro de un div
 * @param param0 
 * @returns 
 */
export function StrapiErrors({ error }: { readonly error: StrapiErrorsProps }) {
    //  Si no hay error retorna null
    if (!error?.message) return null;

    //  Si hay error retorna un div con el error.message
    return <div className="text-pink-500 text-md italic py-2">{error.message}</div>;
}