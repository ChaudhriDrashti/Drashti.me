const SectionSkeleton = () => {
  return (
    <div className="section-padding">
      {/* Section heading skeleton */}
      <div className="flex items-center gap-4 mb-8 animate-pulse">
        <div className="h-6 w-16 bg-secondary/50 rounded" />
        <div className="h-6 w-40 bg-secondary/50 rounded" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-secondary/50 rounded w-full" />
        <div className="h-4 bg-secondary/50 rounded w-5/6" />
        <div className="h-4 bg-secondary/50 rounded w-4/6" />
        <div className="h-4 bg-secondary/50 rounded w-full" />
        <div className="h-4 bg-secondary/50 rounded w-3/4" />
      </div>
    </div>
  );
};

export default SectionSkeleton;
