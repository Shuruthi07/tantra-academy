import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5000/api/gallery";

function Gallery() {

  const [galleryItems, setGalleryItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState(null);


  // ==========================================
  // LOAD GALLERY FROM MONGODB
  // ==========================================

  const loadGallery = async () => {

    try {

      setLoading(true);

      const response = await fetch(API_URL);

      const data = await response.json();

      if (data.success) {

        setGalleryItems(
          data.gallery || []
        );

      } else {

        console.error(
          data.message ||
          "Unable to load gallery"
        );

      }

    } catch (error) {

      console.error(
        "Gallery loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadGallery();

  }, []);


  // ==========================================
  // CLOSE PHOTO
  // ==========================================

  const closePhoto = () => {

    setSelectedPhoto(null);

  };


  return (

    <div className="gallery-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="gallery-page-header">

        <h1>
          Academy Gallery
        </h1>

        <p>
          Explore beautiful moments from
          Tantra Academy
        </p>

      </div>


      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="gallery-loading">

          <div className="gallery-loading-icon">
            🖼️
          </div>

          <p>
            Loading gallery...
          </p>

        </div>

      ) : galleryItems.length === 0 ? (

        /* ====================================
           EMPTY GALLERY
        ==================================== */

        <div className="empty-gallery">

          <div className="empty-gallery-icon">
            🖼️
          </div>

          <h2>
            No Photos Available
          </h2>

          <p>
            Academy photos will appear here
            when the teacher adds them.
          </p>

        </div>

      ) : (

        /* ====================================
           GALLERY GRID
        ==================================== */

        <div className="gallery-grid">

          {galleryItems.map((item) => (

            <div
              className="gallery-card"
              key={item.id}
              onClick={() =>
                setSelectedPhoto(item)
              }
            >

              {/* IMAGE */}

              <div className="gallery-card-image">

                <img
                  src={item.image}
                  alt={item.title}
                />

              </div>


              {/* DETAILS */}

              <div className="gallery-card-content">

                <span className="gallery-category">

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


      {/* ======================================
          PHOTO VIEW MODAL
      ====================================== */}

      {selectedPhoto && (

        <div
          className="gallery-photo-modal"
          onClick={closePhoto}
        >

          <div
            className="gallery-photo-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              className="gallery-photo-close"
              onClick={closePhoto}
            >
              ✕
            </button>


            {/* IMAGE */}

            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.title}
            />


            {/* DETAILS */}

            <div className="gallery-photo-details">

              <span className="gallery-category">

                {selectedPhoto.category}

              </span>

              <h2>

                {selectedPhoto.title}

              </h2>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Gallery;