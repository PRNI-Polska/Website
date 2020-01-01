// @ts-expect-error no types available
import webPush from "web-push";
import { prisma } from "./db";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.CONTACT_EMAIL || "admin@prni.org.pl";
  if (!pub || !priv) return false;
  try {
    webPush.setVapidDetails(`mailto:${email}`, pub, priv);
    vapidConfigured = true;
    return true;
  } catch {
    return false;
  }
}

export async function sendPushToMember(
  memberId: string,
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  if (!ensureVapid()) return;

  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { pushSubscription: true },
    });

    if (!member?.pushSubscription) return;

    const subscription = JSON.parse(member.pushSubscription);
    await webPush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: unknown) {
    // If subscription expired, remove it
    if (err && typeof err === "object" && "statusCode" in err && (err as {statusCode:number}).statusCode === 410) {
      await prisma.member.update({
        where: { id: memberId },
        data: { pushSubscription: null },
      });
    }
  }
}

export async function sendPushToMembers(
  memberIds: string[],
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  await Promise.allSettled(memberIds.map((id) => sendPushToMember(id, payload)));
}
