import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type FormEvent,
	type DragEvent,
} from "react";
import { Link } from "react-router-dom";
import { LucideLoaderPinwheel, X, UploadCloud } from "lucide-react";

import { useGetInfo, usePostInfo } from "../api/api";
import { useToastStore } from "../stores/toast.store";
import useAdminStore from "../stores/admin.stores";

interface StoryAPI {
	_id: string;
	title: string;
	content: string;
	media?: string | string[];
}

interface Story {
	id: string;
	title: string;
	content: string;
	media: string[];
}

interface PreviewItem {
	id: string;
	file: File;
	url: string;
}

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.8;
const MAX_FILES = 8;

const Stories: React.FC = () => {
	const { data, isError, error, isPending, refetch } = useGetInfo("/articles");
	const {
		mutate,
		isError: isPostError,
		error: postError,
		isPending: isPostPending,
	} = usePostInfo("/articles");
	const admin = useAdminStore((s) => s.admin);
	const addToast = useToastStore((s) => s.addToast);

	const [stories, setStories] = useState<Story[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

	const urlSetRef = useRef<Set<string>>(new Set());
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const dragCounterRef = useRef(0);
	const [isDragging, setIsDragging] = useState(false);

	// Helper: unique id
	const makeId = useCallback(() => {
		if (crypto?.randomUUID) return crypto.randomUUID();
		return Math.random().toString(36).slice(2, 9);
	}, []);

	// Normalize fetched stories
	useEffect(() => {
		if (!data) return;
		const normalized = data.map((item: StoryAPI) => {
			let mediaArr: string[] = [];
			if (Array.isArray(item.media)) {
				mediaArr = item.media.filter((m) => typeof m === "string");
			} else if (typeof item.media === "string") {
				mediaArr = [item.media];
			}
			return {
				id: item._id,
				title: item.title,
				content: item.content,
				media: mediaArr,
			};
		});
		setStories(normalized);
	}, [data]);

	// Cleanup on unmount: revoke all object URLs
	useEffect(() => {
		return () => {
			urlSetRef.current.forEach((url) => URL.revokeObjectURL(url));
			urlSetRef.current.clear();
		};
	}, []);

	// Cleanup when previewItems change (remove old URLs)
	useEffect(() => {
		const toDelete: string[] = [];
		urlSetRef.current.forEach((url) => {
			const exists = previewItems.find((pi) => pi.url === url);
			if (!exists) {
				toDelete.push(url);
			}
		});
		toDelete.forEach((url) => {
			URL.revokeObjectURL(url);
			urlSetRef.current.delete(url);
		});
	}, [previewItems]);

	// Compress image
	const compressImage = useCallback(async (file: File): Promise<File> => {
		if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") {
			return file;
		}
		try {
			const imgBitmap = await createImageBitmap(file);
			const { width, height } = imgBitmap;
			let targetWidth = width;
			let targetHeight = height;

			if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
				if (width >= height) {
					targetWidth = MAX_IMAGE_DIMENSION;
					targetHeight = Math.round((height / width) * MAX_IMAGE_DIMENSION);
				} else {
					targetHeight = MAX_IMAGE_DIMENSION;
					targetWidth = Math.round((width / height) * MAX_IMAGE_DIMENSION);
				}
			}

			const canvas = document.createElement("canvas");
			canvas.width = targetWidth;
			canvas.height = targetHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) return file;

			ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);

			const blob = await new Promise<Blob | null>((resolve) => {
				const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
				canvas.toBlob((b) => resolve(b), mime, IMAGE_QUALITY);
			});

			if (!blob) return file;
			const newFile = new File([blob], file.name, { type: blob.type, lastModified: Date.now() });
			return newFile;
		} catch (err) {
			console.warn("Image compression failed:", err);
			useToastStore.getState().addToast("Image compression failed, using original file", "warning");
			return file;
		}
	}, []);

	// Process files: compress, generate preview, limit count
	const processFiles = useCallback(
		async (files: FileList | File[]) => {
			const arr = Array.from(files);
			if (previewItems.length + arr.length > MAX_FILES) {
				addToast(`You can only upload up to ${MAX_FILES} images.`, "error");
				return;
			}
			const newPreviews: PreviewItem[] = [];
			for (const file of arr) {
				const compressed = await compressImage(file);
				const url = URL.createObjectURL(compressed);
				urlSetRef.current.add(url);
				const id = `${makeId()}-${compressed.name}-${compressed.size}`;
				newPreviews.push({ id, file: compressed, url });
				// allow UI to remain responsive
				await new Promise((r) => setTimeout(r, 0));
			}
			setPreviewItems((prev) => [...prev, ...newPreviews]);
		},
		[previewItems.length, compressImage, makeId, addToast]
	);

	const handleFilesChange = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files || files.length === 0) {
				e.target.value = "";
				return;
			}
			await processFiles(files);
			if (fileInputRef.current) fileInputRef.current.value = "";
		},
		[processFiles]
	);

	const handleRemovePreview = useCallback((id: string) => {
		setPreviewItems((prev) => {
			const found = prev.find((pi) => pi.id === id);
			if (found) {
				URL.revokeObjectURL(found.url);
				urlSetRef.current.delete(found.url);
			}
			return prev.filter((pi) => pi.id !== id);
		});
	}, []);

	const clearForm = useCallback(() => {
		previewItems.forEach((pi) => {
			URL.revokeObjectURL(pi.url);
			urlSetRef.current.delete(pi.url);
		});
		setPreviewItems([]);
		setTitle("");
		setContent("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}, [previewItems]);

	const handleSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			if (!title.trim() || !content.trim()) {
				addToast("Title and Content are required.", "error");
				return;
			}
			const form = new FormData();
			form.append("title", title);
			form.append("content", content);
			previewItems.forEach((pi) => {
				form.append("article", pi.file);
			});

			console.log('hello', form, 'hello');


			mutate(form, {
				onSuccess: () => {
					refetch?.();
					clearForm();
					addToast("Story posted successfully!", "success");
				},
				onError: (err) => {
					console.error("Post failed:", err);
					addToast("Failed to post the story.", "error");
				},
			});
		},
		[title, content, previewItems, mutate, refetch, clearForm, addToast]
	);

	// Drag & Drop handlers
	const onDragEnter = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current += 1;
		setIsDragging(true);
	}, []);

	const onDragLeave = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current -= 1;
		if (dragCounterRef.current <= 0) {
			dragCounterRef.current = 0;
			setIsDragging(false);
		}
	}, []);

	const onDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
	}, []);

	const onDrop = useCallback(
		async (e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			dragCounterRef.current = 0;
			const files = e.dataTransfer.files;
			if (files && files.length > 0) {
				await processFiles(files);
			}
		},
		[processFiles]
	);

	// Sub-components
	const PreviewGrid: React.FC = () => (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
			{previewItems.map((pi) => (
				<div key={pi.id} className="relative group overflow-hidden rounded-lg shadow-lg bg-gray-800">
					<img
						src={pi.url}
						alt={pi.file.name}
						className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
						loading="lazy"
					/>
					<button
						type="button"
						aria-label={`Remove ${pi.file.name}`}
						onClick={() => handleRemovePreview(pi.id)}
						className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
					>
						<X size={24} className="text-white" />
					</button>
					<div className="absolute bottom-0 left-0 w-full bg-black/60 px-2 py-1 text-xs text-white truncate">
						{pi.file.name}
					</div>
				</div>
			))}
		</div>
	);

	const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
		<Link
			to={`/stories/${story.id}`}
			className="group block bg-slate-800 hover:bg-slate-700 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 duration-200 overflow-hidden"
		>
			{story.media.length > 0 && (
				<div className="h-48 overflow-hidden">
					<img
						src={story.media[0]}
						alt={`${story.title} thumbnail`}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
						loading="lazy"
					/>
				</div>
			)}
			<div className="p-5">
				<h2 className="text-2xl font-semibold text-white mb-2">{story.title}</h2>
				<p className="text-gray-300 line-clamp-3">{story.content}</p>
			</div>
		</Link>
	);

	return (
		<main className="min-h-screen bg-urbanist-blue text-white p-6 flex flex-col items-center">
			<h1 className="text-4xl font-bold mb-8">Stories</h1>

			{isError && (() => {
				useToastStore.getState().addToast(error?.message || "Failed to load stories", "error");
				return (
					<div
						role="alert"
						aria-live="assertive"
						className="bg-red-600 rounded-md px-4 py-2 mb-4 w-full max-w-xl"
					>
						<h2 className="font-bold">Fetch Error</h2>
						<p>{error?.message || "Something went wrong fetching stories."}</p>
					</div>
				);
			})()}

			{isPending && (
				<div
					className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-md mb-4"
					aria-live="polite"
				>
					<LucideLoaderPinwheel className="animate-spin" aria-hidden="true" />
					<span>Loading stories...</span>
				</div>
			)}

			<section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
				{stories.length > 0 ? stories.map((story) => <StoryCard key={story.id} story={story} />) : (
					<p className="text-gray-300">No stories available.</p>
				)}
			</section>

			{admin && location.pathname.startsWith("/stories") && (
				<form onSubmit={handleSubmit} encType="multipart/form-data" className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-6 space-y-6" aria-busy={isPostPending}>
					<div>
						<label htmlFor="title" className="block text-md font-medium mb-2">Title</label>
						<input
							id="title"
							type="text"
							placeholder="Your story title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							disabled={isPostPending}
							className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
						/>
					</div>

					<div
						onDragEnter={onDragEnter}
						onDragLeave={onDragLeave}
						onDragOver={onDragOver}
						onDrop={onDrop}
						className={`
              relative flex flex-col items-center justify-center w-full p-6 rounded-lg cursor-pointer border-2 border-dashed transition-all duration-200
              ${isDragging
								? "border-blue-400 bg-gray-700/50"
								: "border-gray-600 bg-gray-800"}
              hover:border-blue-500 hover:bg-gray-700/80
            `}
					>
						<UploadCloud size={40} className="text-gray-400 mb-3" aria-hidden="true" />
						<p className="text-lg font-medium text-gray-200">
							Drag & drop images here, or{" "}
							<span className="text-blue-400 underline">click to browse</span>
						</p>
						<p className="mt-1 text-sm text-gray-400">PNG, JPG, WebP (up to {MAX_FILES} images)</p>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleFilesChange}
							disabled={isPostPending}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
					</div>

					{previewItems.length > 0 && <PreviewGrid />}

					<div>
						<label htmlFor="content" className="block text-md font-medium mb-2">Content</label>
						<textarea
							id="content"
							placeholder="Tell your story..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							required
							rows={5}
							disabled={isPostPending}
							className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
						/>
					</div>

					<button
						type="submit"
						disabled={isPostPending}
						className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-lg transition-all duration-200
              ${isPostPending
								? "opacity-60 cursor-not-allowed"
								: "hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5"}
            `}
					>
						{isPostPending ? (
							<>
								<LucideLoaderPinwheel className="animate-spin" aria-hidden="true" />
								<span>Posting...</span>
							</>
						) : (
								"Share Your Story"
						)}
					</button>

					{isPostError && (
						<div
							role="alert"
							aria-live="assertive"
							className="bg-red-600 rounded-md px-4 py-2 text-sm text-white mt-2"
						>
							{postError?.message || "Something went wrong posting your story."}
						</div>
					)}
				</form>
			)}
		</main>
	);
};

export default Stories;

