import { useEffect, useState } from "react"

function TeacherGallery() {

  const [galleryItems, setGalleryItems] = useState(() =>
    JSON.parse(
      localStorage.getItem("tantraGallery")
    ) || []
  )

  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "Event",
    image: ""
  })


  // =========================================
  // LOAD GALLERY
  // =========================================

  function loadGallery() {

    const savedGallery =
      JSON.parse(
        localStorage.getItem("tantraGallery")
      ) || []

    setGalleryItems(savedGallery)

  }


  // =========================================
  // LIVE UPDATE
  // =========================================

  useEffect(() => {

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


  // =========================================
  // IMAGE UPLOAD
  // =========================================

  const handleImageUpload = (e) => {

    const file =
      e.target.files[0]

    if (!file) {
      return
    }


    // CHECK IMAGE TYPE

    if (!file.type.startsWith("image/")) {

      alert(
        "Please select an image file."
      )

      e.target.value = ""
      return

    }


    // MAX 2 MB

    if (file.size > 2 * 1024 * 1024) {

      alert(
        "Please select an image smaller than 2 MB."
      )

      e.target.value = ""
      return

    }


    const reader =
      new FileReader()


    reader.onloadend = () => {

      setFormData(
        (previous) => ({
          ...previous,
          image: reader.result
        })
      )

    }


    reader.readAsDataURL(file)

  }


  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value
      })
    )

  }


  // =========================================
  // ADD PHOTO
  // =========================================

  const handleAddPhoto = (e) => {

    e.preventDefault()


    const cleanTitle =
      formData.title.trim()


    if (!cleanTitle) {

      alert(
        "Please enter a photo title."
      )

      return

    }


    if (!formData.image) {

      alert(
        "Please upload a photo."
      )

      return

    }


    const newPhoto = {

      id:
        Date.now() +
        Math.floor(
          Math.random() * 1000
        ),

      title:
        cleanTitle,

      category:
        formData.category,

      image:
        formData.image

    }


    const updatedGallery = [

      newPhoto,

      ...galleryItems

    ]


    setGalleryItems(
      updatedGallery
    )


    localStorage.setItem(
      "tantraGallery",
      JSON.stringify(
        updatedGallery
      )
    )


    window.dispatchEvent(
      new Event("galleryUpdated")
    )


    // RESET FORM

    setFormData({
      title: "",
      category: "Event",
      image: ""
    })


    setShowForm(false)


    alert(
      "Photo added to gallery! 🖼️"
    )

  }


  // =========================================
  // DELETE PHOTO
  // =========================================

  const handleDelete = (id) => {

    const selectedPhoto =
      galleryItems.find(
        (item) => item.id === id
      )


    const confirmed =
      window.confirm(
        `Delete "${selectedPhoto?.title || "this photo"}"?`
      )


    if (!confirmed) {
      return
    }


    const updatedGallery =
      galleryItems.filter(
        (item) => item.id !== id
      )


    setGalleryItems(
      updatedGallery
    )


    localStorage.setItem(
      "tantraGallery",
      JSON.stringify(
        updatedGallery
      )
    )


    window.dispatchEvent(
      new Event("galleryUpdated")
    )

  }


  // =========================================
  // CLOSE FORM
  // =========================================

  const closeForm = () => {

    setFormData({
      title: "",
      category: "Event",
      image: ""
    })

    setShowForm(false)

  }


  return (

    <div className="teacher-gallery-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="teacher-gallery-header">

        <div>

          <p>
            ACADEMY MEMORIES
          </p>

          <h1>
            Gallery 🖼️
          </h1>

          <span>
            Manage academy photos and special memories.
          </span>

        </div>


        <button
          type="button"
          className="teacher-gallery-add-btn"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Add Photo
        </button>

      </div>


      {/* =================================
          ADD PHOTO FORM
      ================================= */}

      {showForm && (

        <div className="teacher-gallery-form-card">

          <div className="teacher-gallery-form-header">

            <div>

              <p>
                ACADEMY GALLERY
              </p>

              <h2>
                Add Gallery Photo
              </h2>

            </div>


            <button
              type="button"
              onClick={closeForm}
            >
              ✕
            </button>

          </div>


          <form
            onSubmit={handleAddPhoto}
          >


            {/* PHOTO TITLE */}

            <div className="teacher-gallery-form-group">

              <label>
                Photo Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Annual Music Concert"
              />

            </div>


            {/* CATEGORY */}

            <div className="teacher-gallery-form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >

                <option value="Event">
                  Event
                </option>

                <option value="Concert">
                  Concert
                </option>

                <option value="Performance">
                  Performance
                </option>

                <option value="Competition">
                  Competition
                </option>

                <option value="Workshop">
                  Workshop
                </option>

              </select>

            </div>


            {/* IMAGE */}

            <div className="teacher-gallery-form-group">

              <label>
                Upload Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />


              {formData.image && (

                <div className="gallery-upload-preview">

                  <img
                    src={formData.image}
                    alt="Gallery preview"
                  />

                </div>

              )}

            </div>


            {/* SAVE */}

            <button
              type="submit"
              className="teacher-gallery-save-btn"
            >
              💾 Save Photo
            </button>

          </form>

        </div>

      )}


      {/* =================================
          GALLERY
      ================================= */}

      {galleryItems.length === 0 ? (

        <div className="teacher-gallery-empty">

          <div>
            🖼️
          </div>

          <h2>
            No photos added yet
          </h2>

          <p>
            Add photos to display them in the student gallery.
          </p>

        </div>

      ) : (

        <div className="teacher-gallery-grid">

          {galleryItems.map(
            (item) => (

              <div
                className="teacher-gallery-card"
                key={item.id}
              >


                {/* IMAGE */}

                <div className="teacher-gallery-image">

                  <img
                    src={item.image}
                    alt={item.title}
                  />

                </div>


                {/* CONTENT */}

                <div className="teacher-gallery-card-content">

                  <span>
                    {item.category}
                  </span>

                  <h2>
                    {item.title}
                  </h2>


                  <button
                    type="button"
                    className="teacher-gallery-delete-btn"
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  )

}

export default TeacherGallery