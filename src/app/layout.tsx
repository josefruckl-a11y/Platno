import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plátno",
  description: "Art film ratings, combined from Metacritic, Rotten Tomatoes, IMDb and TMDB.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${workSans.variable} h-full`}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
