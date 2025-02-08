import * as React from 'react';

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
		const baseStyles =
			'inline-flex items-center justify-center rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

		const variantStyles = {
			default: 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200',
			destructive: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800',
			outline: 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800',
			secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700',
			ghost: 'hover:bg-zinc-100 text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-50',
			link: 'text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300',
		};

		const sizeStyles = {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 px-3 rounded-md',
			lg: 'h-11 px-8 rounded-md',
			icon: 'h-10 w-10',
		};

		return (
			<button
				ref={ref}
				className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
				{...props}
			/>
		);
	}
);
Button.displayName = 'Button';

export { Button };
