import { getAdminSession } from "@/lib/owner-admin";
import { getOwnerSession, ownerOwnsSlug } from "@/lib/owner-auth";
import { getStaffSession } from "@/lib/owner-staff";

export async function isOpsSession() {
  return Boolean((await getAdminSession()) || (await getStaffSession()));
}

export async function canBookOrBlock(slug: string) {
  if (await isOpsSession()) return true;
  const owner = await getOwnerSession();
  return Boolean(owner && ownerOwnsSlug(owner, slug));
}

export async function canOperateStay(_slug: string) {
  return isOpsSession();
}

export async function canCreateStay(slug: string) {
  if (await isOpsSession()) return true;
  const owner = await getOwnerSession();
  return Boolean(owner && ownerOwnsSlug(owner, slug));
}
