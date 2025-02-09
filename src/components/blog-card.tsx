import {
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	Card,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React from 'react';
import { type Blog } from '@prisma/client';

export const BlogCard = (props: Blog) => {
	const { title, content, image, author, readTime, createdAt } = props;

	return (
		<Card className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-zinc-800">
			{image && (
				<div className="relative">
					<img
						alt="Blog cover"
						className="aspect-[3/2] h-64 w-full object-cover"
						src={image}
						width="420"
						height="280"
					/>
				</div>
			)}
			<CardContent className="p-6">
				<CardTitle className="mb-2 text-2xl font-semibold">
					{title}
				</CardTitle>
				<CardDescription className="mb-4 text-gray-700 dark:text-zinc-100 line-clamp-3">
					{content}
				</CardDescription>
				<div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-zinc-400">
					<span>By {author}</span>
					<span>{readTime} min read</span>
				</div>
				<div className="text-xs text-gray-500 dark:text-zinc-500">
					{new Date(createdAt).toLocaleDateString()}
				</div>
			</CardContent>
			<CardFooter className="bg-gray-50 p-6 dark:bg-zinc-900">
				<Button className="w-full" variant="secondary">
					Read More
				</Button>
			</CardFooter>
		</Card>
	);
};
