import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useGetInfo, usePostInfo } from '../api/api'
import { LoaderCircleIcon, LoaderPinwheel } from 'lucide-react'
import useAdminStore from '../stores/admin.stores'

interface Preview {
  file: File
  url: string
  id: string
}

interface Partner {
  _id: string
  name: string
  media: string
  createdAt: string
  updatedAt: string
}

const Partners: React.FC = () => {
  const { data, isError, error, isPending, refetch } = useGetInfo('/partners')
  const {
    mutate,
    isError: postIsError,
    error: postError,
    isPending: postPending
  } = usePostInfo('/partners')

  const admin = useAdminStore((state) => state.admin)

  const [partners, setPartners] = useState<Partner[]>([])
  const [preview, setPreview] = useState<Preview[]>([])
  const URLSetRef = useRef<Set<string>>(new Set())

  const [post, setPost] = useState<{
    partnerName: string
    media: File | null
  }>({
    partnerName: '',
    media: null
  })

  // Sync fetched partners into state
  useEffect(() => {
    if (Array.isArray(data)) {
      setPartners(data)
    }
  }, [data])

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of URLSetRef.current) {
        try {
          URL.revokeObjectURL(url)
        } catch {
          // ignore
        }
      }
      URLSetRef.current.clear()
    }
  }, [])

  // Handle file input change, create preview
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const url = URL.createObjectURL(file)
    URLSetRef.current.add(url)

    const id = `${file.name}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`

    const newPreview: Preview = { file, url, id }

    // Only allow one preview at a time
    // If you’d like multiple, change this logic
    // Also clean up previous URL
    preview.forEach((p) => {
      URL.revokeObjectURL(p.url)
      URLSetRef.current.delete(p.url)
    })

    setPreview([newPreview])
    setPost((prev) => ({ ...prev, media: file }))
  }, [preview])

  // Remove a preview
  const removePreview = useCallback((id: string) => {
    setPreview((prevArr) => {
      const toRemove = prevArr.find((p) => p.id === id)
      if (toRemove) {
        try {
          URL.revokeObjectURL(toRemove.url)
        } catch {
          // ignore
        }
        URLSetRef.current.delete(toRemove.url)
      }
      const newArr = prevArr.filter((p) => p.id !== id)

      // If the removed preview corresponded to current post.media, clear media
      setPost((old) => {
        if (toRemove && old.media && toRemove.file === old.media) {
          return { partnerName: old.partnerName, media: null }
        }
        return old
      })

      return newArr
    })
  }, [])

  // Submit form
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const nameTrim = post.partnerName.trim()
      if (!nameTrim || !post.media) {
        // Optionally show validation
        return
      }

      const formData = new FormData()
      formData.append('name', nameTrim)
      formData.append('media', post.media)

      mutate(formData, {
        onSuccess: (newPartner) => {
          // Clean up previews and URLs
          for (const url of URLSetRef.current) {
            try {
              URL.revokeObjectURL(url)
            } catch {
              // ignore
            }
          }
          URLSetRef.current.clear()
          setPreview([])
          setPost({ partnerName: '', media: null })

          // Refresh list
          if (typeof refetch === 'function') {
            refetch()
          } else {
            /*             setPartners((prev) => [newPartner, ...prev])
             */
            console.log(newPartner);
          }
        },
        onError: (err) => {
          console.error('Create partner error:', err)
        }
      })
    },
    [post, mutate, refetch]
  )

  return (
    <main className="site-container">
      {isError && (
        <div className="error">
          <h3 className="font-semibold">Oops! Something went wrong.</h3>
          <p>{error?.message ?? 'Please try again later.'}</p>
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
                <p className="text-red-500">
                  {postError?.message ?? 'Error creating partner.'}
                </p>
              )}
              {postPending ? (
                <div>
                  Posting… <LoaderPinwheel className="animate-spin inline ml-2" />
                </div>
              ) : (
                admin !== null && (
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
                              partnerName: e.target.value
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
                            postPending ||
                            !post.partnerName.trim() ||
                            !post.media
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
  )
}

export default Partners
