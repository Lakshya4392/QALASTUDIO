import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseStyles = 'bg-neutral-200';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Pre-built skeleton components for common patterns
export const StudioCardSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[4/3]" />
    <Skeleton variant="text" width="60%" height={20} />
    <Skeleton variant="text" width="80%" height={16} />
    <Skeleton variant="text" width="100%" height={14} />
    <div className="flex gap-2 flex-wrap">
      <Skeleton variant="rectangular" width={80} height={24} />
      <Skeleton variant="rectangular" width={100} height={24} />
      <Skeleton variant="rectangular" width={90} height={24} />
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-black/10">
      <div>
        <Skeleton variant="text" width={80} height={24} />
        <Skeleton variant="text" width={60} height={12} />
      </div>
      <div className="text-right">
        <Skeleton variant="text" width={70} height={12} />
        <Skeleton variant="circular" width={16} height={16} />
      </div>
    </div>
  </div>
);

export const PageHeaderSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton variant="text" width="20%" height={12} />
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="text" width="100%" height={20} />
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <div className="grid grid-cols-5 gap-4 py-4">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} variant="text" height={16} />
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
    <Skeleton variant="text" width="70%" height={24} />
    <Skeleton variant="text" width="100%" height={16} />
    <Skeleton variant="text" width="90%" height={16} />
    <Skeleton variant="text" width="60%" height={16} />
  </div>
);

export default Skeleton;
