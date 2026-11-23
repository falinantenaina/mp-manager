import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addSSEClient, removeSSEClient } from '@/lib/sse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Non autorisé', { status: 401 })

  let controller: ReadableStreamDefaultController

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl
      addSSEClient(ctrl)
      // Ping toutes les 25s pour garder la connexion vivante
      const ping = setInterval(() => {
        try { ctrl.enqueue(`data: ping\n\n`) } catch { clearInterval(ping) }
      }, 25000)
    },
    cancel() {
      removeSSEClient(controller)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
