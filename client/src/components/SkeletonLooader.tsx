import React, { useState } from "react";

interface SkeletonImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({
  fallbackSrc = "/fallback.jpg",
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-64 bg-slate-200 rounded-lg overflow-hidden">
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-slate-300" />
      )}
      <img
        {...props}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setError(true);
          (e.target as HTMLImageElement).src = fallbackSrc;
        }}
        className={`w-full h-64 object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default SkeletonImage;
