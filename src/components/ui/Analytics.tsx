import * as React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title }: { title: string }) {
  return <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}