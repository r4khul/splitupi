/**
 * Thin wrapper around the Web Contact Picker API.
 * Supported on Chrome/Android over HTTPS. Always degrades gracefully.
 */

export interface PickedContact {
  name: string;
  phone: string;
}

interface ContactInfo {
  name?: string[];
  tel?: string[];
}

interface ContactsManagerLike {
  select: (
    props: string[],
    options?: { multiple?: boolean },
  ) => Promise<ContactInfo[]>;
  getProperties?: () => Promise<string[]>;
}

function getManager(): ContactsManagerLike | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as unknown as { contacts?: ContactsManagerLike };
  if (
    nav.contacts &&
    typeof nav.contacts.select === "function" &&
    typeof window !== "undefined" &&
    "ContactsManager" in window
  ) {
    return nav.contacts;
  }
  return null;
}

export function isContactPickerSupported(): boolean {
  return getManager() !== null;
}

/**
 * Opens the native contact picker (multi-select) and returns name + phone.
 * Returns [] if cancelled or unsupported.
 */
export async function pickContacts(): Promise<PickedContact[]> {
  const manager = getManager();
  if (!manager) return [];
  try {
    const selected = await manager.select(["name", "tel"], { multiple: true });
    return selected
      .map((c) => ({
        name: (c.name && c.name[0]) || "",
        phone: (c.tel && c.tel[0]) || "",
      }))
      .filter((c) => c.name || c.phone);
  } catch {
    // User cancelled or permission denied.
    return [];
  }
}
