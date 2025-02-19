'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PaginationProps = {
	totalPages: number;
	hasNextPage: boolean;
};

export const Pagination = ({ totalPages, hasNextPage }: PaginationProps) => {
	const searchParams = useSearchParams();
	const currentPage = Number(searchParams.get('page')) || 1;

	return (
		<div className="flex items-center justify-center space-x-4">
			<Link
				href={`?page=${currentPage - 1}`}
				className={`px-4 py-2 rounded-md border text-sm font-medium ${
					currentPage === 1 ? 'pointer-events-none bg-gray-200' : 'hover:bg-gray-100'
				}`}
			>
				Previous
			</Link>

			{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
				<Link
					key={p}
					href={`?page=${p}`}
					className={`px-4 py-2 rounded-md border text-sm font-medium ${
						p === currentPage ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
					}`}
				>
					{p}
				</Link>
			))}

			<Link
				href={`?page=${currentPage + 1}`}
				className={`px-4 py-2 rounded-md border text-sm font-medium ${
					!hasNextPage ? 'pointer-events-none bg-gray-200' : 'hover:bg-gray-100'
				}`}
			>
				Next
			</Link>
		</div>
	);
};