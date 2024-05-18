import { getSummaries } from "@/data/loaders";
import Link from "next/link";

import { PaginationComponent } from "@/components/custom/PaginationComponent";
import { Search } from "@/components/custom/Search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LinkCardProps {
  id: string;
  title: string;
  summary: string;
}

function LinkCard({ id, title, summary }: Readonly<LinkCardProps>) {
  return (
    <Link href={`/dashboard/summaries/${id}`}>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="leading-8 text-pink-500">
            {title || "Video Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="w-full mb-4 leading-7">
            {summary.slice(0, 164)}
            <span className="text-pink-500"> [read more]</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

interface SearchParamsProps {
  searchParams?: {
    query?: string;
    page?: string;
  };
}

export default async function SummariesRoute({
  searchParams,
}: Readonly<SearchParamsProps>) {
  // Extrae la query de los props
  const query = searchParams?.query ?? "";
  // Extrae la página actual de los props
  const currentPage = Number(searchParams?.page) || 1;
  const { data, meta } = await getSummaries(query, currentPage);
  // Extrae la cantidad de páginas de la meta de strapi
  const pageCount = meta.pagination.pageCount;

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <Search />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item: LinkCardProps) => (
          <LinkCard key={item.id} {...item} />
        ))}
      </div>

      <PaginationComponent pageCount={pageCount} />
    </div>
  );
}
