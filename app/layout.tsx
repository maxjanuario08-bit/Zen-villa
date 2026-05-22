import type { ReactNode } from "react";

/**
 * Obligatoire avec next-intl : le layout `[locale]` fournit `<html>` et `<body>`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
