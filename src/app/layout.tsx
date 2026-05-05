import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AriseOS | Invoice Manager",
  description: "Create, manage, and track invoices with AriseOS — the modern SaaS platform for agencies and freelancers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white selection:bg-cyan-500/30">
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-xs text-navy-400 border-t border-white/5">
          made by young minds of india | powered by{' '}
          <a
            href="https://ariseagency.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500/80 hover:text-cyan-400 transition-colors"
          >
            Ariseagency.in
          </a>
        </footer>
      </body>
    </html>
  );
}
