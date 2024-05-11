import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/custom/Footer";
import { Header } from "@/components/custom/Header";
import { getGlobalMetadata, getGlobalPageData } from "@/data/loaders";
// * Usamos la librería "sonner" desde la implementación de un componente de Shadcn llamado "Toaster"
// * Sirve para mostrar mensajes tipo toast
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// * Esta función extrae la metadata para que se inyecte en la página, ayuda al SEO
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getGlobalMetadata();

  return {
    title: metadata?.title,
    description: metadata?.description,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalData = await getGlobalPageData();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Agregamos el Toaster, se ejecutará cada vez que se llame, aparece en la parte inferior central */}
        <Toaster position="bottom-center" />
        <Header data={globalData.header} />

        <div>
          {children}
        </div>

        <Footer data={globalData.footer} />
      </body>
    </html>
  );
}
