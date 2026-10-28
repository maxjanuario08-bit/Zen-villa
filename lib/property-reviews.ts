import pinson from "@/data/pinson-reviews.json";
export type ReviewPlatformId = "booking" | "airbnb" | "abritel";
export type PropertyReview = {
  id: string; platform: ReviewPlatformId; author: string | null; rating: number;
  title: string; text: string; negative: string; date: string | null;
  dateKind: "stay" | "published"; archived: boolean; language: string; platformTranslated: boolean;
};
export type ReviewPlatform = {id: ReviewPlatformId; name: string; rating: number; scale: number; count: number; url: string | null};
export type PropertyReviewsData = {propertySlug: string; addedAt: string; platforms: ReviewPlatform[]; reviews: PropertyReview[]};
/** Only owner-supplied reviews for this property. No aggregate rating across platforms. */
export function getPropertyReviews(slug: string): PropertyReviewsData | null {
  return slug === pinson.propertySlug ? pinson as PropertyReviewsData : null;
}
export function sortedPropertyReviews(reviews: readonly PropertyReview[]) {
  return [...reviews].sort((a,b)=>(b.date || "").localeCompare(a.date || "") || a.id.localeCompare(b.id));
}
