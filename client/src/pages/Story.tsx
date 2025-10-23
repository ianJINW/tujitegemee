import React from "react";
import { useParams } from "react-router-dom";
import { useGetInfo } from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/error";
import SkeletonImage from "../components/SkeletonLooader";

type Params = { id: string };

const Story: React.FC = () => {
  const { id } = useParams<Params>();
  const { data, error, isError, isPending } = useGetInfo(`/articles/${id}`);

  // Guard: missing ID
  if (!id) {
    return <ErrorMessage message="No story ID provided in the URL." />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorMessage
        message={error?.message ?? "Something went wrong fetching the story."}
      />
    );
  }

  // Loading state
  if (isPending) {
    return <LoadingSpinner message="Please wait while we fetch the story." />;
  }

  // Normalize media into an array
  const mediaItems = data?.media
    ? Array.isArray(data.media)
      ? data.media
      : [data.media]
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {mediaItems.map((url: string, i: number) => (
          <SkeletonImage
            key={i}
            src={url}
            alt={`${data?.title} — image ${i + 1}`}
            className="mb-4 break-inside-avoid rounded-lg shadow"
          />
        ))}

        <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line break-inside-avoid">
          {data?.content}
        </p>
      </div>

    </main>
  );
};

export default Story;
