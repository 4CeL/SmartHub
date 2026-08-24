import { Lexend } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./components/ThemeProvider";

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
          <Sidebar />

          <main className="pl-64">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}