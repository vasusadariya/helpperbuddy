import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const page = Number(searchParams.get('page')) || 1;
	const take = PAGE_SIZE;
	const skip = (page - 1) * take;

	const results = await prisma.blog.findMany({
		take,
		skip,
		orderBy: { createdAt: 'desc' },
	});

	const total = await prisma.blog.count();

	return NextResponse.json({
		data: results,
		metadata: {
			hasNextPage: skip + take < total,
			totalPages: Math.ceil(total / take),
		},
	});
}
