import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/client"
import { Prisma, PrismaClient, Resource, User, Account } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const resource = await prisma.resource.create({
      data,
    })
    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const resources = await prisma.resource.findMany()
    return NextResponse.json(resources)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
