import React, { useState, useEffect, useRef, } from "react";
import { useGetInfo } from "../api/api";
import { LoaderCircle } from "lucide-react";

interface Partner {
  name: string;
  description: string;
  imageUrl?: string;
}

interface Preview {
  file: File;
  url: string;
  id: string;
}

const Partners: React.FC = () => {
  const { data, isError, error, isLoading } = useGetInfo('/partners');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const urlSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (data) {
      setPartners(data);
    }
  }, [data]);

  // Cleanup on unmount: revoke any blob URL still active
  useEffect(() => {
    return () => {
      const urls = Array.from(urlSetRef.current);
      urls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const newPreviews = fileArray.map(file => {
        const url = URL.createObjectURL(file);
        urlSetRef.current.add(url);
        return {
          file,
          url,
          id: `${file.name}-${Date.now()}-${Math.random()}` // simple unique id
        };
      });
      // Option: you might want to append or replace
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePreview = (id: string) => {
    setPreviews(prev => {
      const toRemove = prev.find(p => p.id === id);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.url);
        urlSetRef.current.delete(toRemove.url);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  return (
    <main className="...">
      <h2>Tujitegemee</h2>
      <div>
        {isError && (
          <div className="error ...">
            <h3 className="font-semibold">Oops! Something went wrong.</h3>
            <p>{error?.message ?? 'Please try again later.'}</p>
          </div>
        )}

        {isLoading && (
          <div className="loading ...">
            Loading partners... <LoaderCircle className="animate-spin inline-block ml-2" />
          </div>
        )}

        <section>
          <h1 className="text-4xl font-bold mb-4">Partners Page</h1>
          <div>
            {partners.length > 0 ? (
              partners.map((partner, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-2">{partner.name}</h2>
                  {partner.imageUrl && (
                    <img src={partner.imageUrl} alt={partner.name} className="mb-2 rounded" />
                  )}
                  <p className="text-gray-300">{partner.description}</p>
                </div>
              ))
            ) : (
              <p>No partners available.</p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Upload Partner Images</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mb-4"
          />
          <div className="flex flex-wrap gap-4">
            {previews.map((prev) => (
              <div key={prev.id} className="relative">
                <img
                  src={prev.url}
                  alt={`Preview ${prev.id}`}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removePreview(prev.id)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Partners;
