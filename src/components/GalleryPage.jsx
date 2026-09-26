import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/gallery"

const defaultGalleryItems = [
  {
    id: "default-1",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b",
    title: "Live Concert",
    category: "Concert"
  },
  {
    id: "default-2",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    title: "Music Practice",
    category: "Learning"
  },
  {
    id: "default-3",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0",
    title: "Piano Performance",
    category: "Performance"
  },
  {
    id: "default-4",
    image:
      "https://images.unsplash.com/photo-1524650359799-842906ca1c06",
    title: "Guitar Session",
    category: "Classes"
  },
  {
    id: "default-5",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    title: "Student Performance",
    category: "Performance"
  },
  {
    id: "default-6",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
    title: "Music Workshop",
    category: "Workshop"
  }
]

function GalleryPage() {
  const [galleryItems, setGalleryItems] =
    useState(defaultGalleryItems)

  const [activeCategory, setActiveCategory] =
    useState("All")

  const [selectedImage, setSelectedImage] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  function getAuthHeaders() {
    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      "Content-Type":
        "application/json",

      ...(token
        ? {
            Authorization:
              "Bearer " + token
          }
        : {})
    }
  }

  // =====================================================
  // LOAD GALLERY
  // =====================================================

  async function loadGallery() {
    try {
      setLoading(true)

      const response =
        await fetch(API_URL, {
          method: "GET",
          headers:
            getAuthHeaders(),
          cache: "no-store"
        })

      const data =
        await response.json()

      console.log(
        "Gallery response:",
        response.status,
        data
      )

      if (
        response.ok &&
        data.success
      ) {
        const mongoGallery =
          Array.isArray(
            data.gallery
          )
            ? data.gallery
            : []

        // Normalize MongoDB gallery data
        const formattedGallery =
          mongoGallery.map(
            (item) => ({
              ...item,

              id:
                item.id ||
                item._id,

              image:
                item.image ||
                item.imageUrl ||
                item.url ||
                "",

              title:
                item.title ||
                "Academy Moment",

              category:
                item.category ||
                "Other"
            })
          )

        /*
         * MongoDB items first,
         * followed by the original
         * default gallery.
         */

        setGalleryItems([
          ...formattedGallery,
          ...defaultGalleryItems
        ])
      } else {
        setGalleryItems(
          defaultGalleryItems
        )
      }
    } catch (error) {
      console.error(
        "Gallery loading error:",
        error
      )

      setGalleryItems(
        defaultGalleryItems
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadGallery()

    function handleGalleryUpdated() {
      loadGallery()
    }

    window.addEventListener(
      "galleryUpdated",
      handleGalleryUpdated
    )

    return () => {
      window.removeEventListener(
        "galleryUpdated",
        handleGalleryUpdated
      )
    }
  }, [])

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    "All",
    ...new Set(
      galleryItems
        .map(
          (item) =>
            item.category
        )
        .filter(Boolean)
    )
  ]

  // =====================================================
  // FILTER
  // =====================================================

  const filteredGallery =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter(
          (item) =>
            item.category ===
            activeCategory
        )

  // =====================================================
  // CLOSE IMAGE
  // =====================================================

  function closeImage() {
    setSelectedImage(null)
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="gallery-page">

      {/* HEADER */}

      <div className="gallery-page-header">

        <div>

          <p>
            CAPTURED MOMENTS
          </p>

          <h1>
            Our Gallery 🖼️
          </h1>

          <span>
            Explore performances, workshops and
            memorable moments at Tantra Academy.
          </span>

        </div>

      </div>


      {/* FILTER */}

      <div className="student-gallery-filters">

        {categories.map(
          (category) => (

            <button
              key={category}
              type="button"
              className={
                activeCategory ===
                category
                  ? "student-gallery-filter active"
                  : "student-gallery-filter"
              }
              onClick={() =>
                setActiveCategory(
                  category
                )
              }
            >
              {category}
            </button>

          )
        )}

      </div>


      {/* LOADING */}

      {loading ? (

        <div className="gallery-empty">

          <div>
            🖼️
          </div>

          <h2>
            Loading Gallery...
          </h2>

          <p>
            Please wait while we load
            the latest academy moments.
          </p>

        </div>

      ) : filteredGallery.length ===
        0 ? (

        /* EMPTY */

        <div className="gallery-empty">

          <div>
            🖼️
          </div>

          <h2>
            No photos available
          </h2>

          <p>
            Gallery photos will appear here.
          </p>

        </div>

      ) : (

        /* GALLERY */

        <div className="gallery-grid">

          {filteredGallery.map(
            (item, index) => (

              <div
                className="gallery-card"
                key={
                  item.id ||
                  item._id ||
                  `gallery-${index}`
                }
                onClick={() =>
                  setSelectedImage(
                    item
                  )
                }
              >

                <img
                  src={item.image}
                  alt={
                    item.title ||
                    "Gallery image"
                  }
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none"
                  }}
                />

                <div className="gallery-overlay">

                  <span>
                    {item.category}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* IMAGE MODAL */}

      {selectedImage && (

        <div
          className="gallery-modal-overlay"
          onClick={closeImage}
        >

          <div
            className="gallery-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="gallery-modal-close"
              onClick={closeImage}
            >
              ✕
            </button>

            <img
              src={
                selectedImage.image
              }
              alt={
                selectedImage.title
              }
            />

            <div className="gallery-modal-content">

              <span>
                {
                  selectedImage.category
                }
              </span>

              <h2>
                {
                  selectedImage.title
                }
              </h2>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default GalleryPage