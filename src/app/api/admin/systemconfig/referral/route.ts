import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result: { variable_value: number }[] = await prisma.$queryRaw`
      SELECT variable_value FROM system_config 
      WHERE variable_name = 'referral'
    `
    const config = result[0]

    if (!config) {
      return NextResponse.json(
        { error: 'Referral configuration not found' }, 
        { status: 404 }
      )
    }

    // Return just the number value
    return NextResponse.json(config.variable_value)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch referral configuration' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { variable_value } = body

    if (typeof variable_value !== 'number') {
      return NextResponse.json(
        { error: 'variable_value must be a number' },
        { status: 400 }
      )
    } else if (variable_value > 1000 || variable_value < 0) {
      return NextResponse.json(
        { error: 'variable_value must be less than 1000' },
        { status: 400 }
      )
    }

    const result: { variable_value: number }[] = await prisma.$queryRaw`
      INSERT INTO system_config (variable_name, variable_value, "updatedAt")
      VALUES ('referral', ${variable_value}, '2025-02-15 22:28:22'::timestamp)
      ON CONFLICT (variable_name)
      DO UPDATE SET 
        variable_value = ${variable_value},
        "updatedAt" = '2025-02-15 22:28:22'::timestamp
      RETURNING variable_value
    `
    // Return just the number value
    return NextResponse.json((result)[0].variable_value)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update referral configuration' },
      { status: 500 }
    )
  }
}