import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const services = await prisma.service.findMany();
        return res.json(services);
    }

    if (req.method === 'POST') {
        const { name, description, price, category, image } = req.body;
        const newService = await prisma.service.create({
            data: { name, description, price, category, image },
        });
        return res.status(201).json(newService);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
