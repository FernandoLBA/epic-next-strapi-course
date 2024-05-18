"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
// librería que ejecuta una función debounce, es decir que espera cierto tiempo.
import { useDebouncedCallback } from "use-debounce";

import { Input } from "@/components/ui/input";

export function Search() {
  // Obtiene los params de la url
  const searchParams = useSearchParams();
  // replace recibe una url y la setea en el navegador
  const { replace } = useRouter();
  // Obtiene el path de la url
  const pathname = usePathname();

  /**
   * Esta función controla lo que se tipea en el campo Search.
   * Usa un hook que evita que se hagan llamadas a la api
   * con cada pulsación de tecla que hagamos en el
   * componente "Search".
   * Espera 300 milisegundos para realizar la llamada, si
   * no se sigue tecleando en el campo.
   *
   * Recibe un callback, que a su vez recibe el term, el
   * cuál es un string con lo que deseamos buscar.
   */
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);
    // Crea una url con los params
    const params = new URLSearchParams(searchParams);
    // Setea el page en la url
    params.set("page", "1");

    // Si hay un término de búsqueda lo inyecta a la url query=loQUeSea
    if (term) {
      params.set("query", term);
    } else {
      // Si no se busca nada elimina el query
      params.delete("query");
    }

    // Enlaza la ruta actual con la url que contiene los params de búsqueda
    // y setea esa url en el navegador
    replace(`${pathname}?${params.toString()}`);
  }, 300); // tiempo de delay

  return (
    <div>
      <Input
        type="text"
        placeholder="Search"
        onChange={(e) => handleSearch(e.target.value)}
        // Obtiene query de params y lo setea como value
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  );
}
