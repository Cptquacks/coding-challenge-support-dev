import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Función auxiliar simulada para envío de correos
async function sendEmailNotification(ticketId: string, companyId: string) {
  // FIX BUG 3 INTENCIONAL: Esta promesa nunca se resuelve
  // El hilo se queda bloqueado esperando.

  return new Promise<string>((resolve) => {

    console.log(`Enviando notificación urgente para el ticket ${ticketId}...`)
    resolve(companyId)
    /**
     * Decidi resolverlo de esta manera para en caso de, no se, un entorno real
     * donde deba enviarse un email, se pueda recuperar para alguna floating notification o algo
     * la verdad no se que mas podria añadir
     */
    /**
     * Habia un error en el tipado, sencillo de notar
     */
    // Falta: resolve() o hay un error de lógica
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json()

    // Buscamos el ticket para ver su prioridad
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    if (ticket.priority === 'Urgente' && status === 'Resuelto') {
      // Bug 3: Se queda esperando infinitamente
      await sendEmailNotification(ticket.id, ticket.companyId)
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Error updating ticket' }, { status: 500 })
  }
}
