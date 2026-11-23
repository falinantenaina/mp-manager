// Registre des clients SSE connectés
const clients: Set<ReadableStreamDefaultController> = new Set()

export function addSSEClient(controller: ReadableStreamDefaultController) {
  clients.add(controller)
}

export function removeSSEClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller)
}

export function broadcastUpdate() {
  for (const ctrl of clients) {
    try {
      ctrl.enqueue(`data: update\n\n`)
    } catch {
      clients.delete(ctrl)
    }
  }
}
