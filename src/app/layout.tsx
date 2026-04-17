import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/ui/LanguageContext";
import { JournalProvider } from "@/components/ui/JournalContext";
import { FavoritesProvider } from "@/components/ui/FavoritesContext";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "The Dhamma Path Tarot | ไพ่พุทธธรรมทาโรต์",
  description: "A tarot deck inspired by Buddhist philosophy - The Four Noble Truths",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="font-mono">
      <body className="min-h-screen flex flex-col bg-[#201d1d] text-[#fdfcfc] antialiased">
        <AuthProvider>
          <LanguageProvider>
            <JournalProvider>
              <FavoritesProvider>
                {children}
              </FavoritesProvider>
            </JournalProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}