import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers";
import "./globals.css";
import { ShellLayout } from "@/components/layout/ShellLayout";
import { hasClerk } from "@/lib/constants";

import "bootstrap-icons/font/bootstrap-icons.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--app-font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamPlatform | Free Mock Test India & Online Exam System",
  description: "Class-wise quiz platform and secure online exam system for timed lessons, mock tests, national tests, and student performance tracking.",
  keywords: [
    "free mock test India", "class-wise quiz platform", "online exam system", "secure quizzes", "student learning platform",
    "student exam portal", "academic progression", "student analytics", "online student tests",
    "exam administration", "proctored exam software", "administrator dashboard", "hierarchical access control",
    "educational institutions", "school exam management", "university testing platform", "institutional quiz system"
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <Providers>
      <ShellLayout>{children}</ShellLayout>
    </Providers>
  );

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {hasClerk ? (
          <ClerkProvider>{content}</ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
