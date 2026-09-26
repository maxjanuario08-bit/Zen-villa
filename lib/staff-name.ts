export const STAFF_NAME_KEY = "zv_staff_name";

export function readStaffName() {
  try {
    return localStorage.getItem(STAFF_NAME_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function writeStaffName(name: string) {
  try {
    localStorage.setItem(STAFF_NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}
