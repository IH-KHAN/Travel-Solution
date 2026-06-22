import React from 'react';

const placeholder = (title: string) => {
  const Page: React.FC = () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <div className="card text-center py-16 text-slate-400">
        <p className="text-lg">🚧 {title} page — coming soon</p>
        <p className="text-sm mt-2">This page will be implemented next.</p>
      </div>
    </div>
  );
  Page.displayName = `${title}Page`;
  return Page;
};

export default placeholder;
