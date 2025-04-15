import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ title, children, className = '' }: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-blue-700">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
