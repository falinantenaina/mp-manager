import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToAdmins } from '@/lib/webpush'
import { addSSEClient, broadcastUpdate } from '@/lib/sse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id
  const role = (session.user as any).role

  const tickets = await prisma.ticket.findMany({
    where: role === 'EMPLOYEE' ? { createdById: userId } : {},
    include: { createdBy: { select: { name: true } } },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id
  const { clientName, fbLink, urgency, note } = await req.json()

  const ticket = await prisma.ticket.create({
    data: { clientName, fbLink, urgency, note, createdById: userId },
    include: { createdBy: { select: { name: true } } },
  })

  // Notification push vers les admins
  await sendPushToAdmins({
    title: urgency === 'URGENT' ? '🔴 MP URGENT !' : '📩 Nouveau MP signalé',
    body: `${clientName} · Par ${ticket.createdBy.name}${note ? '\n' + note : ''}`,
    url: '/admin',
    urgency,
  })

  // SSE temps réel
  broadcastUpdate()

  return NextResponse.json(ticket, { status: 201 })
}
