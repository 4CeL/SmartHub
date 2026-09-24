import { Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import ClientWrapper from "./components/ClientWrapper";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

// ======================================================
// WEBSITE METADATA
// ======================================================

export const metadata = {
  title: "Smart Hub",
  description: "All in 1 Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lexend.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}