import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Devis et informations",
  description:
    "Contactez Zenvilla pour un devis personnalisé. Réponse rapide 7j/7. Propriétaires de villas et voyageurs en Corse Sud.",
  openGraph: {
    title: "Contact | Zenvilla – Conciergerie Corse Sud",
    description:
      "Demandez un devis ou des informations. Notre équipe vous répond rapidement.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
