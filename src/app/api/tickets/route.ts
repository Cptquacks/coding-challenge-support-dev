import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: `El parametro company ID es invalido: ${companyId}` }, { status: 404 })
    }

    // FIX BUG 4 INTENCIONAL: Fuga de datos
    // El usuario (simulado) pertenece a 'TechCorp', pero aquí traemos todos los tickets
    // de la base de datos sin filtrar.
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      where: { companyId: companyId }
      /** 
       * En un entorno real se deberia filtrar tambien
       * por la session del usuario, para mas seguridad
      */
      // Falta: where: { companyId: 'TechCorp' } o usando el usuario de la sesión
    })

    if (!tickets) {
      return NextResponse.json({ error: `No se pudieron solicitar los tickets de la compañia ${companyId}: ${tickets}` }, { status: 404 })
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Error fetching tickets' }, { status: 500 })
  }
}
