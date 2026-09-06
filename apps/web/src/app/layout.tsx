import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Na Rua — caderneta de fiado",
  description:
    "A caderneta que não some, e que cobra por você sem você precisar brigar com o freguês.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Na Rua", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0b5fff",
  width: "device-width",
  initialScale: 1,
  // Sem maximumScale: limitar zoom é hostil com quem precisa aumentar a fonte.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
