import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	type FormEvent,
	type ChangeEvent,
} from "react";
import { useGetInfo, usePostInfo } from "../api/api";
import { useToastStore } from "../stores/toast.store";
import { LoaderCircleIcon, LoaderPinwheel } from "lucide-react";
import useAdminStore from "../stores/admin.stores";
import { useLocation } from "react-router-dom";

interface Preview {
	file: File;
	url: string;
	id: string;
}

interface Partner {
	_id: string;
	name: string;
	media: string;
	createdAt: string;
	updatedAt: string;
}

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.8;

const Partners: React.FC = () => {
	// --- Data / API Hooks ---
	const { data, isError, error, isPending, refetch } = useGetInfo("/partners");
	const {
		mutate,
		isError: postIsError,
		error: postError,
		isPending: postPending,
	} = usePostInfo("/partners");

	const admin = useAdminStore((s) => s.admin);
	const location = useLocation();

	// --- Local State ---
	const [partners, setPartners] = useState<Partner[]>([]);
	const [previewList, setPreviewList] = useState<Preview[]>([]);
	const [formState, setFormState] = useState<{
		partnerName: string;
		media: File | null;
	}>({
		partnerName: "",
		media: null,
	});

	// Track created object‑URLs to revoke later
	const urlSetRef = useRef<Set<string>>(new Set<string>());

	// --- Effects ---

	// Populate partners when data arrives
	useEffect(() => {
		if (Array.isArray(data)) {
			setPartners(data as Partner[]);
		}
	}, [data]);

	// Cleanup all object URLs when component unmounts
	useEffect(() => {
		return () => {
			urlSetRef.current.forEach((u) => {
				try {
					URL.revokeObjectURL(u);
				} catch {
					// ignore
				}
			});
			urlSetRef.current.clear();
		};
	}, []);

	// --- Helpers ---

	// Compress an image if it’s too large
	const compressImage = async (file: File): Promise<File> => {
		if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") {
			return file;
		}
		try {
			const imgBitmap = await createImageBitmap(file);
			const { width, height } = imgBitmap;
			let targetW = width;
			let targetH = height;

			if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
				if (width >= height) {
					targetW = MAX_IMAGE_DIMENSION;
					targetH = Math.round((height / width) * MAX_IMAGE_DIMENSION);
				} else {
					targetH = MAX_IMAGE_DIMENSION;
					targetW = Math.round((width / height) * MAX_IMAGE_DIMENSION);
				}
			}

			const canvas = document.createElement("canvas");
			canvas.width = targetW;
			canvas.height = targetH;
			const ctx = canvas.getContext("2d");
			if (!ctx) return file;

			ctx.drawImage(imgBitmap, 0, 0, targetW, targetH);

			const blob = await new Promise<Blob | null>((resolve) => {
				canvas.toBlob(
					(b) => resolve(b),
					file.type === "image/png" ? "image/png" : "image/jpeg",
					IMAGE_QUALITY
				);
			});

			if (!blob) return file;

			return new File([blob], file.name, {
				type: blob.type,
				lastModified: Date.now(),
			});
		} catch (err) {
			console.warn("Compression failed, using original file:", err);
			useToastStore.getState().addToast("Image compression failed, using original file", "warning");
			return file;
		}
	};

	// Generate a unique preview object from a file
	const makePreview = (file: File): Preview => {
		const url = URL.createObjectURL(file);
		urlSetRef.current.add(url);
		const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		return { file, url, id };
	};

	// --- Handlers ---

	const handleFileChange = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files || files.length === 0) return;

			const compressed = await compressImage(files[0]);
			const preview = makePreview(compressed);

			// Clean up previous previews
			previewList.forEach((p) => {
				try {
					URL.revokeObjectURL(p.url);
				} catch (err) {
					console.error(err, 'failed to revoke URL');

				}
				urlSetRef.current.delete(p.url);
			});

			setPreviewList([preview]);
			setFormState((prev) => ({ ...prev, media: compressed }));
		},
		[previewList]
	);

	const handleRemovePreview = useCallback(
		(id: string) => {
			setPreviewList((oldList) => {
				const toRemove = oldList.find((p) => p.id === id);
				if (toRemove) {
					try {
						URL.revokeObjectURL(toRemove.url);
					} catch (err) {
						console.error(err, 'failed to revoke URL');

					}
					urlSetRef.current.delete(toRemove.url);
				}
				const newList = oldList.filter((p) => p.id !== id);

				setFormState((old) => {
					if (toRemove && old.media && toRemove.file === old.media) {
						return { ...old, media: null };
					}
					return old;
				});

				return newList;
			});
		},
		[]
	);

	const handleSubmit = useCallback(
		(e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const nameTrim = formState.partnerName.trim();
			if (!nameTrim || !formState.media) {
				useToastStore.getState().addToast("Please provide both partner name and image", "error");
				return;
			}

			const formData = new FormData();
			formData.append("name", nameTrim);
			formData.append("media", formState.media);

			mutate(formData, {
				onSuccess: () => {
					urlSetRef.current.forEach((u) => {
						try {
							URL.revokeObjectURL(u);
						} catch (error) {
							console.error(error, 'failed to revoke URL');
						}
					});
					urlSetRef.current.clear();
					setPreviewList([]);
					setFormState({ partnerName: "", media: null });
					if (typeof refetch === "function") refetch();
					useToastStore.getState().addToast("Partner added successfully!", "success");
				},
				onError: (error) => {
					console.error("Error posting partner:", error);
					useToastStore.getState().addToast(
						error instanceof Error ? error.message : "Failed to add partner",
						"error"
					);
				},
			});
		},
		[formState, mutate, refetch]
	);

	return (
		<main className="site-container">
			{/* Error state */}
			{isError && (() => {
				useToastStore.getState().addToast(
					error?.message ?? "Failed to load partners",
					"error"
				);
				return (
					<div className="card bg-[var(--color-error-light)] text-[var(--color-error)] p-4 mb-6">
						<h3 className="font-semibold">Oops! Something went wrong.</h3>
						<p>{error?.message ?? "Please try again later."}</p>
					</div>
				);
			})()}

			{/* Loading state */}
			{isPending ? (
				<section className="flex items-center gap-2 text-[var(--text-secondary)]">
					Loading… <LoaderCircleIcon className="animate-spin" />
				</section>
			) : (
				<>
						{/* Partners Grid */}
						<section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
							{partners.map((p) => (
								<div key={p._id} className="card flex flex-col items-center text-center p-4">
									<img
										src={p.media}
										alt={p.name}
										className="w-24 h-24 object-cover rounded-full mb-3"
								/>
									<h3 className="font-medium text-[var(--text-primary)]">{p.name}</h3>
							</div>
						))}
						</section>

						{/* Add Partner Form (only for admin at correct route) */}
						{admin && location.pathname.startsWith("/partners") && (
							<section className="mt-10 card p-6">
								<h2 className="text-xl font-semibold mb-4">Add Partner</h2>
								{postIsError && (
									<p className="text-[var(--color-error)] mb-3">{postError?.toString()}</p>
								)}
								{postPending ? (
									<div className="flex items-center gap-2">
										Posting… <LoaderPinwheel className="animate-spin" />
									</div>
								) : (
										<form
											onSubmit={handleSubmit}
											encType="multipart/form-data"
											className="space-y-5"
										>
											<div>
												<label htmlFor="partnersImage" className="block font-medium mb-1">
													Partner’s Logo
												</label>
												<input
													id="partnersImage"
													type="file"
													accept="image/*"
													required
													className="input-base"
													disabled={postPending}
													onChange={handleFileChange}
												/>
												<div className="mt-3 grid grid-cols-2 gap-2">
													{previewList.map((pr) => (
														<div
															key={pr.id}
															className="relative rounded overflow-hidden shadow-sm"
														>
															<img
																src={pr.url}
																alt="Preview"
																className="w-full h-auto object-cover rounded-md"
															/>
															<button
																type="button"
																onClick={() => handleRemovePreview(pr.id)}
																className="btn btn--icon btn-danger absolute top-1 right-1"
																disabled={postPending}
															>
																×
															</button>
														</div>
													))}
												</div>
											</div>

											<div>
												<label htmlFor="partnerName" className="block font-medium mb-1">
													Partner’s Name
												</label>
												<input
													id="partnerName"
													type="text"
													required
													value={formState.partnerName}
													onChange={(e) =>
														setFormState((old) => ({
															...old,
															partnerName: e.target.value,
														}))
													}
													placeholder="Enter partner’s name"
													className="input-base"
													disabled={postPending}
												/>
											</div>

											<div>
												<input
													type="submit"
													value="Submit"
													className="btn btn-primary"
													disabled={
														postPending ||
														!formState.partnerName.trim() ||
														!formState.media
													}
												/>
											</div>
										</form>
								)}
							</section>
						)}
				</>
			)}
		</main>
	);
};

export default Partners;
