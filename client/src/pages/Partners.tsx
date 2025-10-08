import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGetInfo, usePostInfo } from "../api/api";
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
	media: string; // URL or path to media (stored on backend)
	createdAt: string;
	updatedAt: string;
}

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.8;

const Partners: React.FC = () => {
	const { data, isError, error, isPending, refetch } = useGetInfo("/partners");
	const {
		mutate,
		isError: postIsError,
		error: postError,
		isPending: postPending,
	} = usePostInfo("/partners");

	const admin = useAdminStore((state) => state.admin);

	const [partners, setPartners] = useState<Partner[]>([]);
	const [preview, setPreview] = useState<Preview[]>([]);
	const URLSetRef = useRef<Set<string>>(new Set());

	const [post, setPost] = useState<{
		partnerName: string;
		media: File | null;
	}>({
		partnerName: "",
		media: null,
	});

	const loc = useLocation();

	// Synchronize fetched partners
	useEffect(() => {
		if (Array.isArray(data)) {
			setPartners(data as Partner[]);
		}
	}, [data]);

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			for (const u of URLSetRef.current) {
				try {
					URL.revokeObjectURL(u);
				} catch {
					// ignore
				}
			}
			URLSetRef.current.clear();
		};
	}, []);

	// Compress image helper
	const compressImage = async (file: File): Promise<File> => {
		if (
			!file.type.startsWith("image/") ||
			typeof createImageBitmap !== "function"
		) {
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
			console.warn("Image compression failed, using original:", err);
			return file;
		}
	};

	// Handle file input change + preview + setting post.media
	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			e.preventDefault();
			const files = e.target.files;
			if (!files || files.length === 0) return;

			const originalFile = files[0];
			const compressedFile = await compressImage(originalFile);

			const url = URL.createObjectURL(compressedFile);
			URLSetRef.current.add(url);

			const id = `${compressedFile.name}-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 9)}`;

			const newPreview: Preview = { file: compressedFile, url, id };

			// Clear old previews
			preview.forEach((p) => {
				URL.revokeObjectURL(p.url);
				URLSetRef.current.delete(p.url);
			});

			setPreview([newPreview]);
			setPost((prev) => ({ ...prev, media: compressedFile }));
		},
		[preview]
	);

	// Remove a preview and possibly clear media
	const removePreview = useCallback((id: string) => {
		setPreview((prevArr) => {
			const toRemove = prevArr.find((p) => p.id === id);
			if (toRemove) {
				try {
					URL.revokeObjectURL(toRemove.url);
				} catch {
					// ignore
				}
				URLSetRef.current.delete(toRemove.url);
			}
			const newArr = prevArr.filter((p) => p.id !== id);

			setPost((old) => {
				if (toRemove && old.media && toRemove.file === old.media) {
					return { partnerName: old.partnerName, media: null };
				}
				return old;
			});

			return newArr;
		});
	}, []);

	// Submit the form
	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const nameTrim = post.partnerName.trim();
			if (!nameTrim || !post.media) {
				// validation fail
				return;
			}

			const formData = new FormData();
			formData.append("name", nameTrim);
			formData.append("media", post.media);

			mutate(formData, {
				onSuccess: (newPartner) => {
					// clean up previews / urls
					for (const u of URLSetRef.current) {
						try {
							URL.revokeObjectURL(u);
						} catch {
							// ignore
						}
					}
					URLSetRef.current.clear();
					setPreview([]);
					setPost({ partnerName: "", media: null });

					if (typeof refetch === "function") {
						refetch();
					} else {
						console.log("Partner created:", newPartner);
					}
				},
				onError: (err) => {
					console.error("Create partner error:", err);
				},
			});
		},
		[post, mutate, refetch]
	);

	return (
		<main className="site-container">
			{isError && (
				<div className="error">
					<h3 className="font-semibold">Oops! Something went wrong.</h3>
					<p>{error?.message ?? "Please try again later."}</p>
				</div>
			)}

			{isPending ? (
				<section>
					Loading… <LoaderCircleIcon className="animate-spin inline ml-2" />
				</section>
			) : (
				<>
					<section className="flex flex-row w-full gap-4 flex-wrap">
						{partners.map((partner) => (
							<div key={partner._id} className="flex items-center gap-4">
								<img
									src={partner.media}
									alt={partner.name}
									className="w-20 h-20 object-cover rounded"
								/>
								<h3 className="font-medium">{partner.name}</h3>
							</div>
						))}
					</section>

					<section className="mt-6">
						{postIsError && (
							<p className="text-error">{postError?.toString()}</p>
						)}
						{postPending ? (
							<div>
								Posting… <LoaderPinwheel className="animate-spin inline ml-2" />
							</div>
						) : (
							admin !== null &&
							loc.pathname.startsWith("/partners") && (
								<fieldset>
									<legend>Add Partner</legend>
									<form onSubmit={handleSubmit}>
										<div>
											<label htmlFor="partnersImage">Partner’s Logo</label>
											<input
												type="file"
												name="partnersImage"
												id="partnersImage"
												onChange={handleFileChange}
												accept="image/*"
												required
												className="input-base"
												disabled={postPending}
											/>
											<div className="mt-2 grid grid-cols-2 gap-2">
												{preview.map((prev) => (
													<div key={prev.id} className="relative">
														<img
															src={prev.url}
															alt={`Preview ${prev.id}`}
															className="w-full h-full object-cover rounded-md"
														/>
														<button
															type="button"
															onClick={() => removePreview(prev.id)}
															className="btn btn--icon btn-danger absolute top-1 right-1"
															disabled={postPending}
														>
															X
														</button>
													</div>
												))}
											</div>
										</div>

										<div className="mt-4">
											<label htmlFor="partnerName">Partner’s Name</label>
											<input
												type="text"
												name="partnerName"
												id="partnerName"
												required
												onChange={(e) =>
													setPost((prev) => ({
														...prev,
														partnerName: e.target.value,
													}))
												}
												value={post.partnerName}
												placeholder="Input partner’s name"
												disabled={postPending}
												className="input-base"
											/>
										</div>

										<div className="mt-4">
											<input
												type="submit"
												value="Submit"
												className="btn btn-primary"
												disabled={
													postPending || !post.partnerName.trim() || !post.media
												}
											/>
										</div>
									</form>
								</fieldset>
							)
						)}
					</section>
				</>
			)}
		</main>
	);
};

export default Partners;
