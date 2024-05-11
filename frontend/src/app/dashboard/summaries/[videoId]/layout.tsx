// * esta importación remueve el erro de hydration que aparece en este componente
import dynamic from "next/dynamic";

// * Importamos de esta manera el componente YouTubePlayer para evitar el error de hydration
const YouTubePlayer = dynamic(
  () => import("@/components/custom/YouTubePlayer"),
  { ssr: false }
);
import { getSummaryById } from "@/data/loaders";
import { extractYouTubeID } from "@/lib/utils";
import { notFound } from "next/navigation";

/**
 * Este layout muestra la card del summary (children)
 * y el video de YouTube, usando el componente
 * YouTubePlayer
 * @param param0
 * @returns
 */
export default async function SummarySingleRoute({
  params,
  children,
}: {
  readonly params: any;
  readonly children: React.ReactNode;
}) {
  // * Trae el summary según su id
  const data = await getSummaryById(params.videoId);

  // * Si el status del error es 404 retorna el componente not-found de summaries
  if (data?.error?.status === 404) return notFound();

  // * Extrae el id del video de YouTube
  const videoId = extractYouTubeID(data.videoId);

  return (
    <div>
      <div className="h-full grid gap-4 grid-cols-5 p-4">
        <div className="col-span-3">{children}</div>
        <div className="col-span-2">
          <div>
            <YouTubePlayer videoId={videoId} />
          </div>
        </div>
      </div>
    </div>
  );
}
