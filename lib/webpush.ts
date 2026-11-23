import webpush from 'web-push'
import { prisma } from './prisma'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToAdmins(payload: object) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    include: { pushSubscriptions: true },
  })

  const payloadStr = JSON.stringify(payload)

  for (const admin of admins) {
    for (const sub of admin.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payloadStr
        )
      } catch (err: any) {
        // Subscription expirée → on la supprime
        if (err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } })
        }
      }
    }
  }
}
