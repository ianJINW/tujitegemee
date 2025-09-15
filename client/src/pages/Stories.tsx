import React, {
	useState,
	useEffect,
	useRef,
} from "react";
import { useGetInfo, usePostInfo } from "../api/api";
import { LucideLoaderPinwheel } from "lucide-react";

interface Story {
	id: string;            // ideally backend provides a unique ID
	title: string;
	content: string;
	imageUrls?: string[];  // array of URLs if backend returns multiple images
}

interface PreviewItem {
	file: File;
	url: string;
	id: string;  // stable unique key for preview item
}

const Stories: React.FC = () => {
	const { data, isError, error, isPending } = useGetInfo("/stories");
	const {
		mutate,
		isError: isPostError,
		error: postError,
		isPending: isPostPending,
	} = usePostInfo("/stories");

	const [stories, setStories] = useState<Story[]>([]);

	// Form data separated a bit for previews and files
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

	// Keep track of object URLs to revoke
	const urlSetRef = useRef<Set<string>>(new Set());

	// Load stories from fetched data
	useEffect(() => {
		if (data) {
			setStories(data);
		}
	}, [data]);

	// Cleanup on unmount: revoke all preview URLs
	useEffect(() => {
		return () => {
			urlSetRef.current.forEach((url) => {
				URL.revokeObjectURL(url);
			});
			urlSetRef.current.clear();
		};
	}, []);

	const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		const fileArray = Array.from(files);

		// First revoke all old preview URLs
		previewItems.forEach((item) => {
			URL.revokeObjectURL(item.url);
			urlSetRef.current.delete(item.url);
		});

		// Create new previews
		const newPreviewItems: PreviewItem[] = fileArray.map((file) => {
			const url = URL.createObjectURL(file);
			urlSetRef.current.add(url);
			// Generate a stable id: maybe file name + timestamp or better if you can use some UUID
			const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			return { file, url, id };
		});

		setPreviewItems(newPreviewItems);
	};

	const handleRemovePreview = (id: string) => {
		setPreviewItems((prev) => {
			const itemToRemove = prev.find((p) => p.id === id);
			if (itemToRemove) {
				URL.revokeObjectURL(itemToRemove.url);
				urlSetRef.current.delete(itemToRemove.url);
			}
			return prev.filter((p) => p.id !== id);
		});
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!title.trim() || !content.trim()) {
			// maybe show error
			return;
		}

		const payload = new FormData();
		payload.append("title", title);
		payload.append("content", content);
		previewItems.forEach((item) => {
			// adjust key name "images" or whatever your backend expects
			payload.append("images", item.file);
		});

		// Post
		mutate(payload);

		// Reset form & cleanup previews
		previewItems.forEach((item) => {
			URL.revokeObjectURL(item.url);
			urlSetRef.current.delete(item.url);
		});
		setPreviewItems([]);
		setTitle("");
		setContent("");
	};

	return (
		<main className="bg-urbanist-blue min-h-screen flex flex-col items-center justify-center text-white p-4 rounded-lg m-4">
			<h1 className="text-4xl font-bold mb-6">Stories Page</h1>

			{isError && (
				<div className="error bg-red-500 rounded-lg p-2 mb-4">
					<h3 className="font-semibold">Oops! Something went wrong.</h3>
					<p>{error?.message || "Please try again later."}</p>
				</div>
			)}

			{isPostError && (
				<div className="error bg-red-500 rounded-lg p-2 mb-4">
					<h3 className="font-semibold">Error Posting Story</h3>
					<p>{postError?.message || "Please try again later."}</p>
				</div>
			)}

			{isPending && (
				<div className="loading bg-green-500 rounded-lg p-2 mb-4 flex items-center">
					Loading stories...
					<LucideLoaderPinwheel className="animate-spin inline-block ml-2" />
				</div>
			)}

			{/* Story list */}
			<section className="w-full max-w-2xl mb-8">
				{stories.length > 0 ? (
					stories.map((story) => (
						<div
							key={story.id}
							className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-800"
						>
							<h2 className="text-2xl font-semibold mb-2">{story.title}</h2>
							{story.imageUrls && story.imageUrls.length > 0 && (
								<div className="grid grid-cols-2 gap-2 mb-2">
									{story.imageUrls.map((url, i) => (
										<img
											key={`${story.id}-img-${i}`}
											src={url}
											alt={`story-img-${i}`}
											className="rounded object-cover w-full h-40"
										/>
									))}
								</div>
							)}
							<p className="text-gray-300">{story.content}</p>
						</div>
					))
				) : (
					<p>No stories available.</p>
				)}
			</section>

			{/* Form to post story */}
			<form
				className="w-full max-w-md flex flex-col gap-4 bg-gray-900 shadow-lg rounded-lg p-6"
				onSubmit={handleSubmit}
				encType="multipart/form-data"
			>
				<div>
					<label htmlFor="title" className="block mb-1">
						Title
					</label>
					<input
						placeholder="Input your title"
						type="text"
						id="title"
						name="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="w-full px-2 py-1 rounded text-black"
					/>
				</div>

				<div>
					<label htmlFor="images" className="block mb-1">
						Images
					</label>
					<input
						id="images"
						name="images"
						type="file"
						accept="image/*"
						multiple
						onChange={handleFilesChange}
						className="block text-black"
					/>
				</div>

				{previewItems.length > 0 && (
					<div className="grid grid-cols-2 gap-2 mb-4">
						{previewItems.map((item) => (
							<div key={item.id} className="relative">
								<img
									src={item.url}
									alt={`preview-${item.id}`}
									className="rounded object-cover w-full h-32"
								/>
								<button
									type="button"
									className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
									onClick={() => handleRemovePreview(item.id)}
								>
									×
								</button>
							</div>
						))}
					</div>
				)}

				<div>
					<label htmlFor="content" className="block mb-1">
						Content
					</label>
					<textarea
						placeholder="Tell your story"
						id="content"
						name="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						className="w-full px-2 py-1 rounded text-black"
						rows={4}
					/>
				</div>

				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
					disabled={isPostPending}
				>
					{isPostPending ? (
						<>
							<LucideLoaderPinwheel className="animate-spin mr-2" />
							Posting...
						</>
					) : (
						"Share your story"
					)}
				</button>
			</form>
		</main>
	);
};

export default Stories;
