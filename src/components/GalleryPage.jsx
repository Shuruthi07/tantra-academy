import { useEffect, useState } from "react"

const defaultGalleryItems = [
  {
    id: "default-1",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b",
    title: "Live Concert",
    category: "Concert"
  },
  {
    id: "default-2",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    title: "Music Practice",
    category: "Learning"
  },
  {
    id: "default-3",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0",
    title: "Piano Performance",
    category: "Performance"
  },
  {
    id: "default-4",
    image: "https://images.unsplash.com/photo-1524650359799-842906ca1c06",
    title: "Guitar Session",
    category: "Classes"
  },
  {
    id: "default-5",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    title: "Student Performance",
    category: "Performance"
  },
  {
    id: "default-6",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
    title: "Music Workshop",
    category: "Workshop"
  }
]


function GalleryPage() {

  const [galleryItems, setGalleryItems] =
    useState([])


  const [activeCategory, setActiveCategory] =
    useState("All")


  const [selectedImage, setSelectedImage] =
    useState(null)



  // ==============================
  // LOAD GALLERY
  // ==============================

  useEffect(() => {

    function loadGallery() {

      const savedGallery =
        JSON.parse(
          localStorage.getItem("tantraGallery")
        ) || []


      setGalleryItems([
        ...savedGallery,
        ...defaultGalleryItems
      ])

    }


    loadGallery()


    window.addEventListener(
      "storage",
      loadGallery
    )


    window.addEventListener(
      "galleryUpdated",
      loadGallery
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadGallery
      )


      window.removeEventListener(
        "galleryUpdated",
        loadGallery
      )

    }

  }, [])



  // ==============================
  // CATEGORIES
  // ==============================

  const categories = [
    "All",
    ...new Set(
      galleryItems
        .map(
          (item) => item.category
        )
        .filter(Boolean)
    )
  ]



  // ==============================
  // FILTER
  // ==============================

  const filteredGallery =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter(
          (item) =>
            item.category ===
            activeCategory
        )



  return (

    <div className="gallery-page">


      {/* ==============================
          HEADER
          ============================== */}

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



      {/* ==============================
          FILTER
          ============================== */}

      <div className="student-gallery-filters">

        {categories.map((category) => (

          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? "student-gallery-filter active"
                : "student-gallery-filter"
            }
            onClick={() =>
              setActiveCategory(category)
            }
          >
            {category}
          </button>

        ))}

      </div>



      {/* ==============================
          GALLERY
          ============================== */}

      {filteredGallery.length === 0 ? (

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

        <div className="gallery-grid">

          {filteredGallery.map((item) => (

            <div
              className="gallery-card"
              key={item.id}
              onClick={() =>
                setSelectedImage(item)
              }
            >

              <img
                src={item.image}
                alt={item.title}
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

          ))}

        </div>

      )}



      {/* ==============================
          IMAGE PREVIEW
          ============================== */}

      {selectedImage && (

        <div
          className="gallery-modal-overlay"
          onClick={() =>
            setSelectedImage(null)
          }
        >

          <div
            className="gallery-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="gallery-modal-close"
              onClick={() =>
                setSelectedImage(null)
              }
            >
              ✕
            </button>


            <img
              src={selectedImage.image}
              alt={selectedImage.title}
            />


            <div className="gallery-modal-content">

              <span>
                {selectedImage.category}
              </span>


              <h2>
                {selectedImage.title}
              </h2>

            </div>

          </div>

        </div>

      )}

    </div>

  )
}


export default GalleryPage