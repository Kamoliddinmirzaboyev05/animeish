import { motion } from 'framer-motion';

const SkeletonBase = ({ className }: { className: string }) => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
    className={`bg-dark-lighter/50 rounded-lg overflow-hidden ${className}`}
  />
);

export const AnimeCardSkeleton = () => (
  <div className="w-full">
    <div className="aspect-[2/3] rounded-lg bg-dark-light/30 relative overflow-hidden">
      <SkeletonBase className="absolute inset-0" />
    </div>
    <div className="mt-3 space-y-2">
      <SkeletonBase className="h-4 w-3/4" />
      <SkeletonBase className="h-3 w-1/2" />
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-dark overflow-hidden">
    <SkeletonBase className="absolute inset-0" />
    <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-4">
      <SkeletonBase className="h-10 w-2/3 max-w-lg" />
      <SkeletonBase className="h-4 w-1/2 max-w-md" />
      <div className="flex gap-4">
        <SkeletonBase className="h-12 w-32 rounded-full" />
        <SkeletonBase className="h-12 w-32 rounded-full" />
      </div>
    </div>
  </div>
);

export const AnimeSliderSkeleton = ({ title }: { title?: string }) => (
  <div className="mb-8 px-4 sm:px-0">
    {title && <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>}
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex-none w-36 sm:w-44 lg:w-48">
          <AnimeCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

export const AnimeDetailSkeleton = () => (
  <div className="min-h-screen bg-dark">
    <div className="h-[50vh] sm:h-[60vh] relative">
      <SkeletonBase className="absolute inset-0" />
    </div>
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <SkeletonBase className="h-12 w-2/3" />
          <div className="flex gap-4">
            <SkeletonBase className="h-6 w-20" />
            <SkeletonBase className="h-6 w-20" />
            <SkeletonBase className="h-6 w-20" />
          </div>
          <SkeletonBase className="h-32 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <SkeletonBase className="h-3 w-20" />
                <SkeletonBase className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-80 space-y-4">
          <SkeletonBase className="h-8 w-32 mb-4" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 h-20">
              <SkeletonBase className="w-24 h-full" />
              <div className="flex-1 py-2 space-y-2">
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
