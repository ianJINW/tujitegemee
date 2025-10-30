import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { usePostInfo } from "../api/api";
import { Eraser, Loader2Icon } from "lucide-react";

const Docs: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { mutate, error, isError, isPending } = usePostInfo("/articles");

  const fileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      if (selected.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setErrorMessage("Only .docx files are allowed.");
        setFile(null);
        return;
      }
      const maxSizeBytes = 5 * 1024 * 1024;
      if (selected.size > maxSizeBytes) {
        setErrorMessage("File size must be less than 5MB.");
        setFile(null);
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!file) {
      setErrorMessage("Please select a .docx file to upload.");
      return;
    }
    if (!title.trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());

    mutate(formData, {
      onSuccess: () => {
        setMessage(`Upload successful! Document ID:`);
        setTitle("");
        setFile(null);
      },
      onError: (err) => {
        console.error("Upload failed:", err);
        setErrorMessage("Upload failed. Please try again.");
      },
    });
  };

  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-12 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
        <Eraser className="w-5 h-5" /> 
        <span>Error: {error instanceof Error ? error.message : "Unknown error"}</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Upload Document</h2>

      {isPending && (
        <div className="flex items-center justify-center mb-4 text-indigo-600">
          <Loader2Icon className="w-5 h-5 animate-spin mr-2" />
          <span>Uploading…</span>
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate className="space-y-5">
        <div className="flex flex-col">
          <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            required
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="file" className="text-sm font-medium text-gray-700 mb-1">DOCX File</label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".docx"
            onChange={fileChange}
            required
            disabled={isPending}
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors disabled:opacity-50"
          />
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 text-white font-semibold bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isPending ? "Uploading…" : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default Docs;
