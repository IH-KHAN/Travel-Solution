import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  viewAllLink,
  viewAllLabel = 'View All',
  centered = false,
}) => {
  return (
    <div className={`flex items-end justify-between mb-8 ${centered ? 'flex-col text-center gap-2' : ''}`}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p className="section-subtitle mt-1">{subtitle}</p>
        )}
      </div>
      {viewAllLink && !centered && (
        <Link
          to={viewAllLink}
          className="flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 whitespace-nowrap hover:opacity-80"
          style={{ color: 'var(--brand-navy)' }}
        >
          {viewAllLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
