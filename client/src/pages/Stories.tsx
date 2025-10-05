import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetInfo, usePostInfo } from "../api/api";
import { LucideLoaderPinwheel, X, UploadCloud } from "lucide-react";
import useAdminStore from "../stores/admin.stores";

interface Story {
	id: string;
	title: string;
	content: string;
	media?: string[];
}

interface PreviewItem {
	file: File;
	url: string;
	id: string;
}

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.8;

const Stories: React.FC = () => {
	const { data, isError, error, isPending, refetch } = useGetInfo("/articles");
	const {
		mutate,
		isError: isPostError,
		error: postError,
		isPending: isPostPending,
	} = usePostInfo("/articles");
	const admin = useAdminStore(state => state.admin)

	const [stories, setStories] = useState<Story[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
	const urlSetRef = useRef<Set<string>>(new Set());
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const dragCounterRef = useRef(0);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		if (data) {
			setStories(data);
		}
	}, [data]);

	// cleanup on unmount
	useEffect(() => {
		return () => {
			urlSetRef.current.forEach((u) => {
				URL.revokeObjectURL(u);
			});
			urlSetRef.current.clear();
		};
	}, []);

	// cleanup removed previews
	useEffect(() => {
		const toDelete: string[] = [];
		urlSetRef.current.forEach((u) => {
			const still = previewItems.find((p) => p.url === u);
			if (!still) toDelete.push(u);
		});
		toDelete.forEach((u) => {
			URL.revokeObjectURL(u);
			urlSetRef.current.delete(u);
		});
	}, [previewItems]);

	const makeId = useCallback(() => {
		if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
			// @ts-ignore
			return crypto.randomUUID();
		}
		return Math.random().toString(36).slice(2, 9);
	}, []);

	const compressImage = async (file: File): Promise<File> => {
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

			const blob: Blob | null = await new Promise((resolve) => {
				const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
				canvas.toBlob((b) => resolve(b), mime, IMAGE_QUALITY);
			});

			if (!blob) return file;
			const newFile = new File([blob], file.name, {
				type: blob.type,
				lastModified: Date.now(),
			});
			return newFile;
		} catch (err) {
			console.warn("Image compression failed, using original", err);
			return file;
		}
	};

	const processFiles = useCallback(
		async (files: FileList | File[]) => {
			const arr = Array.from(files);
			const processed = await Promise.all(
				arr.map(async (file) => {
					const compressed = await compressImage(file);
					const url = URL.createObjectURL(compressed);
					urlSetRef.current.add(url);
					const id = `${makeId()}-${compressed.name}-${compressed.size}`;
					return { file: compressed, url, id };
				})
			);
			setPreviewItems((prev) => [...prev, ...processed]);
		},
		[makeId]
	);

	const handleFilesChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
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
			const item = prev.find((p) => p.id === id);
			if (item) {
				URL.revokeObjectURL(item.url);
				urlSetRef.current.delete(item.url);
			}
			return prev.filter((p) => p.id !== id);
		});
	}, []);

	const clearFormAndPreviews = useCallback(() => {
		previewItems.forEach((item) => {
			try {
				URL.revokeObjectURL(item.url);
				urlSetRef.current.delete(item.url);
			} catch (e) {
				// ignore
				console.log(e);


			}
		});
		setPreviewItems([]);
		setTitle("");
		setContent("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}, [previewItems]);

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (!title.trim() || !content.trim()) {
				// you could use inline validation here instead of alert
				alert("Please fill in title and content.");
				return;
			}

			const payload = new FormData();
			payload.append("title", title);
			payload.append("content", content);
			previewItems.forEach((item) => {
				payload.append("article", item.file);
			});

			mutate(payload, {
				onSuccess: (response) => {
					// refetch stories so the new one shows up
					if (typeof refetch === "function") {
						refetch();
					}
					console.log(response);
					clearFormAndPreviews();
				},
				onError: (err) => {
					console.error("Post failed:", err);
					// you may choose to keep existing previews so user can retry
				},
			});
		},
		[title, content, previewItems, mutate, refetch, clearFormAndPreviews]
	);

	const onDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current += 1;
		setIsDragging(true);
	}, []);

	const onDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current -= 1;
		if (dragCounterRef.current <= 0) {
			dragCounterRef.current = 0;
			setIsDragging(false);
		}
	}, []);

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
	}, []);

	const onDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
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

	return (
		<main className="min-h-screen bg-urbanist-blue text-white p-6 flex flex-col items-center">
			<h1 className="text-4xl font-bold mb-8">Stories</h1>

			{isError && (
				<div role="alert" aria-live="assertive" className="bg-red-600 rounded-md px-4 py-2 mb-4 w-full max-w-xl">
					<h2 className="font-bold">Fetch Error</h2>
					<p>{error?.message ?? "Something went wrong fetching stories."}</p>
				</div>
			)}
			{isPostError && (
				<div role="alert" aria-live="assertive" className="bg-red-600 rounded-md px-4 py-2 mb-4 w-full max-w-xl">
					<h2 className="font-bold">Post Error</h2>
					<p>{postError?.message ?? "Something went wrong posting your story."}</p>
				</div>
			)}

			{isPending && (
				<div className="flex items-center gap-2 bg-success px-4 py-2 rounded-md mb-4" aria-live="polite">
					<LucideLoaderPinwheel className="animate-spin" aria-hidden="true" />
					<span>Loading stories...</span>
				</div>
			)}

			<section className="w-full max-w-3xl space-y-6 mb-12">
				{stories.length > 0 ? (
					stories.map((story) => (
						<article key={story.id} className="bg-slate-800 p-5 rounded-2xl shadow-sm" aria-labelledby={`story-title-${story.id}`}>
							<h2 id={`story-title-${story.id}`} className="text-2xl font-semibold mb-2">
								{story.title}
							</h2>
							<p className="text-slate-300 mb-3">{story.content}</p>
							{story.media && story.media.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{story.media.map((url, i) => (
										<img
											key={i}
											src={url}
											alt={`${story.title} — image ${i + 1}`}
											className="rounded w-full h-40 object-cover"
											loading="lazy"
										/>
									))}
								</div>
							)}
						</article>
					))
				) : (
						<p className="text-slate-300">No stories available.</p>
				)}
			</section>

			{admin && (<form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-surface-3 w-full max-w-md p-6 rounded-lg shadow-lg space-y-4" aria-busy={isPostPending}>
				<div>
					<label htmlFor="title" className="block font-medium mb-1">
						Title
					</label>
					<input
						id="title"
						type="text"
						placeholder="Your story title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="input-base"
						disabled={isPostPending}
					/>
				</div>

				<div
					onDragEnter={onDragEnter}
					onDragLeave={onDragLeave}
					onDragOver={onDragOver}
					onDrop={onDrop}
					className={`rounded border-2 p-3 transition ${isDragging
						? "border-dashed border-white/70 bg-white/5"
						: "border-transparent"
						}`}
				>
					<label className="block font-medium mb-1">Images</label>
					<div className="flex gap-2 items-center flex-row">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="btn btn-ghost inline-flex items-center gap-2"
							disabled={isPostPending}
						>
							<UploadCloud size={18} aria-hidden="true" />
							<span>Add images</span>
						</button>
						<p className="text-sm text-slate-400">or drag & drop here (png, jpg, webp)</p>
					</div>

					<input
						ref={fileInputRef}
						id="images"
						name="article"
						type="file"
						accept="image/*"
						multiple
						onChange={handleFilesChange}
						className="sr-only"
						disabled={isPostPending}
					/>
				</div>

				{previewItems.length > 0 && (
					<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
						{previewItems.map((item) => (
							<div key={item.id} className="relative group overflow-hidden rounded shadow bg-slate-700">
								<img
									src={item.url}
									alt={item.file.name}
									className="w-full h-28 object-cover rounded group-hover:opacity-80"
									loading="lazy"
								/>
								<button
									type="button"
									aria-label={`Remove ${item.file.name}`}
									onClick={() => handleRemovePreview(item.id)}
									className="btn btn--icon btn-danger absolute top-1 right-1"
									disabled={isPostPending}
								>
									<X size={14} aria-hidden="true" />
								</button>
								<div className="absolute left-1 bottom-1 px-1 py-0.5 bg-black/50 rounded text-xs">
									<span className="sr-only">File:</span>
									{item.file.name}
								</div>
							</div>
						))}
					</div>
				)}

				<div>
					<label htmlFor="content" className="block font-medium mb-1">
						Content
					</label>
					<textarea
						id="content"
						placeholder="Tell your story..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						rows={5}
						className="input-base"
						disabled={isPostPending}
					/>
				</div>

				<button
					type="submit"
					disabled={isPostPending}
					className={`btn btn-primary w-full flex items-center justify-center gap-2 ${isPostPending ? "opacity-70 cursor-not-allowed" : ""
						}`}
				>
					{isPostPending ? (
						<>
							<LucideLoaderPinwheel className="animate-spin" aria-hidden="true" />
							<span>Posting...</span>
						</>
					) : (
						"Share your story"
					)}
				</button>
			</form>)}
		</main>
	);
};

export default Stories;
