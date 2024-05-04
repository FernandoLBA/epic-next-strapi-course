import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { getGlobalMetadata, getGlobalPageData } from "@/data/loaders";
import { Header } from "@/components/custom/Header";
import { Footer } from "@/components/custom/Footer";

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
        <Header data={globalData.header} />
        <div>
          {children}
        </div>
        <Footer data={globalData.footer} />
      </body>
    </html>
  );
}
