import pinson from "@/data/pinson-reviews.json";
export type ReviewPlatformId = "booking" | "airbnb" | "abritel";
export type PropertyReview = {
  id: string; platform: ReviewPlatformId; author: string | null; rating: number;
  countryCode: string | null;
  title: string; text: string; negative: string; date: string | null;
  dateKind: "stay" | "published"; archived: boolean; language: string; platformTranslated: boolean;
};
export type ReviewPlatform = {id: ReviewPlatformId; name: string; rating: number; scale: number; count: number; url: string | null};
export type PropertyReviewsData = {propertySlug: string; addedAt: string; platforms: ReviewPlatform[]; reviews: PropertyReview[]};
/** Only owner-supplied reviews for this property. No aggregate rating across platforms. */
export function getPropertyReviews(slug: string): PropertyReviewsData | null {
  return slug === pinson.propertySlug ? pinson as PropertyReviewsData : null;
}
export type ReviewText = Pick<PropertyReview, "title" | "text" | "negative">;
export type ReviewTranslations = Record<string, ReviewText>;
/** Written reviews first; scores are compared on the same scale, then by date. */
export function sortedPropertyReviews(reviews: readonly PropertyReview[], platforms: readonly ReviewPlatform[]) {
  const scales = new Map(platforms.map(platform => [platform.id, platform.scale]));
  const commented = (review: PropertyReview) => Number(Boolean(review.text.trim() || review.negative.trim()));
  const score = (review: PropertyReview) => review.rating / (scales.get(review.platform) || 10);
  return [...reviews].sort((a,b)=>commented(b)-commented(a) || score(b)-score(a) || (b.date || "").localeCompare(a.date || "") || a.id.localeCompare(b.id));
}
