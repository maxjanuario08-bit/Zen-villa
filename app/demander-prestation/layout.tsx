import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demander une prestation – Transport, petit-déj, activités",
  description:
    "Demandez une prestation pour votre séjour en villa : transport, petit-déjeuner, activités nautiques, balades équestres, location équipement. ZenVilla Corse Sud.",
  openGraph: {
    title: "Demander une prestation | ZenVilla – Voyageurs",
    description:
      "Transport, petit-déjeuner, activités nautiques, balades à cheval… Demandez votre prestation en Corse Sud.",
  },
};

export default function DemanderPrestationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
