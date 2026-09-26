import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/gallery"

function TeacherGallery() {
  const [galleryItems, setGalleryItems] =
    useState([])

  const [showForm, setShowForm] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "Concert",
    image: ""
  })

  // =====================================================
  // JWT HEADERS
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
        "Teacher Gallery:",
        response.status,
        data
      )

      if (
        response.ok &&
        data.success
      ) {
        const gallery =
          Array.isArray(
            data.gallery
          )
            ? data.gallery
            : []

        const formattedGallery =
          gallery.map(
            item => ({
              ...item,

              id:
                item.id ||
                item._id,

              image:
                item.image ||
                item.imageUrl ||
                "",

              title:
                item.title ||
                "Academy Moment",

              category:
                item.category ||
                "Other"
            })
          )

        setGalleryItems(
          formattedGallery
        )
      } else {
        setGalleryItems([])
      }
    } catch (error) {
      console.error(
        "Gallery loading error:",
        error
      )

      alert(
        "Unable to connect to Gallery server."
      )

      setGalleryItems([])
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
  // FORM INPUT
  // =====================================================

  function handleInputChange(event) {
    const {
      name,
      value
    } = event.target

    setFormData(
      previous => ({
        ...previous,
        [name]: value
      })
    )
  }

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  function handleImageChange(event) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    // Image type validation

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image file."
      )

      event.target.value = ""
      return
    }

    // Maximum 2 MB

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 2 MB."
      )

      event.target.value = ""
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      setFormData(
        previous => ({
          ...previous,
          image:
            reader.result
        })
      )
    }

    reader.onerror = () => {
      alert(
        "Unable to read the selected image."
      )
    }

    reader.readAsDataURL(file)
  }

  // =====================================================
  // ADD PHOTO
  // =====================================================

  async function handleAddPhoto(event) {
    event.preventDefault()

    if (
      !formData.title.trim()
    ) {
      alert(
        "Please enter a photo title."
      )
      return
    }

    if (!formData.image) {
      alert(
        "Please select an image."
      )
      return
    }

    try {
      setLoading(true)

      const response =
        await fetch(API_URL, {
          method: "POST",

          headers:
            getAuthHeaders(),

          body: JSON.stringify({
            title:
              formData.title.trim(),

            category:
              formData.category,

            image:
              formData.image
          })
        })

      const data =
        await response.json()

      console.log(
        "Add gallery response:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
          "Unable to add photo."
        )
        return
      }

      alert(
        "Photo added successfully! 🎉"
      )

      setFormData({
        title: "",
        category: "Concert",
        image: ""
      })

      setShowForm(false)

      await loadGallery()

      window.dispatchEvent(
        new Event(
          "galleryUpdated"
        )
      )
    } catch (error) {
      console.error(
        "Add photo error:",
        error
      )

      alert(
        "Unable to connect to Gallery server."
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // DELETE PHOTO
  // =====================================================

  async function handleDelete(id) {
    if (!id) {
      alert(
        "Gallery item ID not found."
      )
      return
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this photo?"
      )

    if (!confirmDelete) {
      return
    }

    try {
      setLoading(true)

      const response =
        await fetch(
          `${API_URL}/${id}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      console.log(
        "Delete gallery response:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
          "Unable to delete photo."
        )
        return
      }

      alert(
        "Photo deleted successfully! 🗑️"
      )

      await loadGallery()

      window.dispatchEvent(
        new Event(
          "galleryUpdated"
        )
      )
    } catch (error) {
      console.error(
        "Delete photo error:",
        error
      )

      alert(
        "Unable to connect to Gallery server."
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="teacher-gallery-page">

      {/* HEADER */}

      <div className="teacher-gallery-header">

        <div>
          <p>
            ACADEMY GALLERY
          </p>

          <h1>
            Gallery 🖼️
          </h1>

          <span>
            Manage academy photos and
            memorable moments.
          </span>
        </div>

        <button
          type="button"
          className="add-photo-btn"
          onClick={() =>
            setShowForm(
              previous =>
                !previous
            )
          }
        >
          {showForm
            ? "✕ Close"
            : "+ Add Photo"}
        </button>

      </div>


      {/* ADD PHOTO FORM */}

      {showForm && (
        <form
          className="gallery-form"
          onSubmit={
            handleAddPhoto
          }
        >

          <h2>
            Add New Photo
          </h2>

          {/* TITLE */}

          <div className="form-group">

            <label>
              Photo Title
            </label>

            <input
              type="text"
              name="title"
              value={
                formData.title
              }
              onChange={
                handleInputChange
              }
              placeholder="Enter photo title"
              required
            />

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={
                formData.category
              }
              onChange={
                handleInputChange
              }
            >

              <option value="Concert">
                Concert
              </option>

              <option value="Learning">
                Learning
              </option>

              <option value="Performance">
                Performance
              </option>

              <option value="Classes">
                Classes
              </option>

              <option value="Workshop">
                Workshop
              </option>

              <option value="Competition">
                Competition
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* IMAGE */}

          <div className="form-group">

            <label>
              Select Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
            />

            <small>
              Maximum image size:
              2 MB
            </small>

          </div>


          {/* IMAGE PREVIEW */}

          {formData.image && (
            <div className="gallery-image-preview">

              <img
                src={
                  formData.image
                }
                alt="Preview"
              />

            </div>
          )}


          {/* SAVE */}

          <button
            type="submit"
            className="save-photo-btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Photo"}
          </button>

        </form>
      )}


      {/* GALLERY CONTENT */}

      <div className="teacher-gallery-content">

        {loading &&
        galleryItems.length ===
          0 ? (

          <div className="empty-gallery">

            <div className="empty-gallery-icon">
              ⏳
            </div>

            <h2>
              Loading Gallery...
            </h2>

            <p>
              Please wait while
              gallery items load.
            </p>

          </div>

        ) : galleryItems.length ===
          0 ? (

          <div className="empty-gallery">

            <div className="empty-gallery-icon">
              🖼️
            </div>

            <h2>
              No Photos Yet
            </h2>

            <p>
              Add your first academy
              photo to the gallery.
            </p>

          </div>

        ) : (

          <div className="gallery-grid">

            {galleryItems.map(
              (item, index) => (

                <div
                  className="gallery-card"
                  key={
                    item.id ||
                    item._id ||
                    `gallery-${index}`
                  }
                >

                  {/* IMAGE */}

                  <div className="gallery-card-image">

                    <img
                      src={
                        item.image ||
                        item.imageUrl
                      }
                      alt={
                        item.title ||
                        "Gallery image"
                      }
                    />

                  </div>


                  {/* DETAILS */}

                  <div className="gallery-card-content">

                    <span className="gallery-category">
                      {
                        item.category
                      }
                    </span>

                    <h3>
                      {
                        item.title
                      }
                    </h3>

                    <button
                      type="button"
                      className="delete-gallery-btn"
                      onClick={() =>
                        handleDelete(
                          item.id ||
                          item._id
                        )
                      }
                      disabled={
                        loading
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

    </div>
  )
}

export default TeacherGallery