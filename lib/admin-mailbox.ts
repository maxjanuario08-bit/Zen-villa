import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export async function readMailbox(uid: number | null, offset = 0) {
  const user = process.env.ZENVILLA_IMAP_USER?.trim();
  const pass = process.env.ZENVILLA_IMAP_PASSWORD;
  if (!user || !pass) return null;
  const client = new ImapFlow({
    host: "imap.hostinger.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
    connectionTimeout: 4500,
    greetingTimeout: 4500,
    socketTimeout: 7000,
    disableAutoIdle: true,
  });
  client.on("error", () => {});
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX", { readOnly: true });
    try {
      if (uid !== null) {
        const info = await client.fetchOne(String(uid), { size: true }, { uid: true });
        if (!info) return { missing: true };
        if ((info.size ?? Infinity) > 512 * 1024) return { tooLarge: true };
        const raw = await client.fetchOne(String(uid), { source: true }, { uid: true });
        if (!raw || !raw.source) return { missing: true };
        const mail = await simpleParser(raw.source, { skipHtmlToText: false, skipTextToHtml: true, skipImageLinks: true });
        return { body: (mail.text ?? "").slice(0, 24000) };
      }
      const total = client.mailbox ? client.mailbox.exists : 0;
      const end = total - offset;
      const messages = end > 0
        ? await client.fetchAll(`${Math.max(1, end - 24)}:${end}`, { envelope: true, flags: true })
        : [];
      return { total, messages: messages.reverse().map(({ uid, envelope, flags }) => ({
        uid, subject: envelope?.subject || "Sans objet",
        from: envelope?.from?.[0]?.address || "", date: envelope?.date instanceof Date ? envelope.date.toISOString() : envelope?.date ?? "",
        unread: !flags?.has("\\Seen"),
      })) };
    } finally {
      lock.release();
    }
  } finally {
    client.close();
  }
}
