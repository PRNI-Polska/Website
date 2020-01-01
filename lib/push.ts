// @ts-expect-error no types available
import webPush from "web-push";
import { prisma } from "./db";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.CONTACT_EMAIL || "mailto:admin@prni.org.pl";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushToMember(
  memberId: string,
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

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
