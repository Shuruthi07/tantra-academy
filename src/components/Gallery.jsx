import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const defaultGalleryItems = [
  {
    id: "home-1",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b",
    title: "Live Concert",
    category: "Concert"
  },
  {
    id: "home-2",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    title: "Music Practice",
    category: "Learning"
  },
  {
    id: "home-3",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0",
    title: "Piano Performance",
    category: "Performance"
  },
  {
    id: "home-4",
    image: "https://images.unsplash.com/photo-1524650359799-842906ca1c06",
    title: "Guitar Session",
    category: "Classes"
  },
  {
    id: "home-5",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    title: "Student Performance",
    category: "Performance"
  },
  {
    id: "home-6",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
    title: "Music Workshop",
    category: "Workshop"
  }
]


function Gallery() {

  const [galleryItems, setGalleryItems] =
    useState(defaultGalleryItems)


  // ==============================
  // LOAD TEACHER GALLERY
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


  // Show only first 6 photos
  // on the Home page

  const previewItems =
    galleryItems.slice(0, 6)


  return (

    <section className="gallery-section">


      {/* ==============================
          HEADER
      ============================== */}

      <div className="gallery-home-header">

        <div className="section-heading">

          <p>
            ACADEMY MEMORIES
          </p>


          <h2>
            Gallery 🖼️
          </h2>


          <span>
            Explore performances, concerts and special moments.
          </span>

        </div>


        {/* ==============================
            VIEW ALL
            ============================== */}

        <Link
          to="/gallery"
          className="gallery-view-all-btn"
        >
          🖼️ View All
        </Link>

      </div>



      {/* ==============================
          GALLERY GRID
          ============================== */}

      <div className="gallery-grid">

        {previewItems.map((item) => (

          <div
            className="gallery-card"
            key={item.id}
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

    </section>

  )
}


export default Gallery