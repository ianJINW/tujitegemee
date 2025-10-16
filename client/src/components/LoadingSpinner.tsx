import React from "react";
import { LucideLoaderPinwheel } from "lucide-react";

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="p-6 flex items-center gap-3 text-blue-600" aria-busy="true">
    <LucideLoaderPinwheel className="animate-spin" />
    <span>{message}</span>
  </div>
);

export default LoadingSpinner;
