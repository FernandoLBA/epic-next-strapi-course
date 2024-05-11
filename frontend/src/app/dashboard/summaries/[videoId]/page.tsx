import { SummaryCardForm } from "@/components/forms/SummaryCardForm";
import { getSummaryById } from "@/data/loaders";

interface ParamsProps {
  params: {
    videoId: string;
  };
}

/**
 * Este componente muestra un summary dentro de una card
 * @param param0
 * @returns
 */
export default async function SummaryCardRoute({
  params,
}: Readonly<ParamsProps>) {
  // * Trae el summary por id
  const data = await getSummaryById(params.videoId);

  return <SummaryCardForm item={data} />;
}
