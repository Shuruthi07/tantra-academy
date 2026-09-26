import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminGallery() {

  const navigate = useNavigate()

  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showAddForm, setShowAddForm] =
    useState(false)

  const [title, setTitle] =
    useState("")

  const [category, setCategory] =
    useState("Event")

  const [image, setImage] =
    useState("")

  const [imageName, setImageName] =
    useState("")

  const [saving, setSaving] =
    useState(false)

  const API_URL =
    "https://tantra-academy-1.onrender.com/api/gallery"

  // ==========================================
  // JWT AUTH HEADERS
  // ==========================================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      Authorization:
        "Bearer " + token
    }
  }

  // ==========================================
  // LOAD GALLERY
  // ==========================================

  async function loadGallery() {

    try {

      setLoading(true)
      setError("")

      const response =
        await fetch(
          `${API_URL}/`,
          {
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to load gallery."
        )

      }

      setGallery(
        Array.isArray(data.gallery)
          ? data.gallery
          : []
      )

    } catch (error) {

      console.error(
        "Admin gallery error:",
        error
      )

      setError(
        error.message ||
        "Unable to load gallery."
      )

      setGallery([])

    } finally {

      setLoading(false)

    }

  }

  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadGallery()

  }, [])

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  function handleImageChange(event) {

    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    // Maximum 2 MB

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      alert(
        "Please select an image smaller than 2 MB."
      )

      event.target.value = ""

      return
    }

    setImageName(
      file.name
    )

    const reader =
      new FileReader()

    reader.onload = () => {

      setImage(
        reader.result
      )

    }

    reader.onerror = () => {

      alert(
        "Unable to read the image."
      )

      setImage("")

    }

    reader.readAsDataURL(file)

  }

  // ==========================================
  // ADD PHOTO
  // ==========================================

  async function handleAddPhoto(event) {

    event.preventDefault()

    if (!title.trim()) {

      alert(
        "Please enter a photo title."
      )

      return
    }

    if (!image) {

      alert(
        "Please select an image."
      )

      return
    }

    try {

      setSaving(true)

      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              ...getAuthHeaders(),

              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              title:
                title.trim(),

              category:
                category,

              image:
                image
            })
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to add photo."
        )

      }

      alert(
        "Photo added successfully! 🎉"
      )

      setTitle("")
      setCategory("Event")
      setImage("")
      setImageName("")

      const fileInput =
        document.getElementById(
          "admin-gallery-image"
        )

      if (fileInput) {
        fileInput.value = ""
      }

      setShowAddForm(false)

      await loadGallery()

    } catch (error) {

      console.error(
        "Add gallery photo error:",
        error
      )

      alert(
        error.message ||
        "Unable to add photo."
      )

    } finally {

      setSaving(false)

    }

  }

  // ==========================================
  // DELETE PHOTO
  // ==========================================

  async function handleDelete(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this photo?"
      )

    if (!confirmed) {
      return
    }

    try {

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

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to delete photo."
        )

      }

      setGallery(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      )

      alert(
        "Photo deleted successfully."
      )

    } catch (error) {

      console.error(
        "Delete gallery photo error:",
        error
      )

      alert(
        error.message ||
        "Unable to delete photo."
      )

    }

  }

  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="admin-dashboard">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="admin-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Gallery Management 🖼️
          </h1>

          <span>
            Manage Tantra Academy photos and memories.
          </span>

        </div>

      </div>

      {/* ======================================
          ACTION BUTTONS
      ====================================== */}

      <div className="admin-gallery-actions">

        <button
          className="admin-back-btn"
          onClick={() =>
            navigate(
              "/admin-dashboard"
            )
          }
        >
          ← Dashboard
        </button>

        <button
          className="admin-gallery-add-btn"
          onClick={() =>
            setShowAddForm(
              !showAddForm
            )
          }
        >
          {showAddForm
            ? "✕ Close"
            : "＋ Add Photo"}
        </button>

        <button
          className="admin-back-btn"
          onClick={loadGallery}
        >
          🔄 Refresh
        </button>

      </div>

      {/* ======================================
          ADD PHOTO FORM
      ====================================== */}

      {showAddForm && (

        <div className="admin-gallery-form">

          <div className="admin-gallery-form-heading">

            <p>
              ADD NEW PHOTO
            </p>

            <h2>
              Upload Gallery Photo
            </h2>

          </div>

          <form
            onSubmit={
              handleAddPhoto
            }
          >

            {/* TITLE */}

            <div className="admin-gallery-field">

              <label>
                Photo Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Enter photo title"
              />

            </div>

            {/* CATEGORY */}

            <div className="admin-gallery-field">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >

                <option value="Event">
                  Event
                </option>

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

              </select>

            </div>

            {/* IMAGE */}

            <div className="admin-gallery-field">

              <label>
                Select Image
              </label>

              <input
                id="admin-gallery-image"
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />

              {imageName && (

                <small>
                  Selected: {imageName}
                </small>

              )}

              <small>
                Maximum image size: 2 MB
              </small>

            </div>

            {/* PREVIEW */}

            {image && (

              <div className="admin-gallery-preview">

                <p>
                  Image Preview
                </p>

                <img
                  src={image}
                  alt="Gallery preview"
                />

              </div>

            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="admin-gallery-save-btn"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "✓ Add Photo"}

            </button>

          </form>

        </div>

      )}

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="admin-stats">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🖼️
          </div>

          <div>

            <p>
              Total Photos
            </p>

            <h2>
              {loading
                ? "..."
                : gallery.length}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🎵
          </div>

          <div>

            <p>
              Academy Gallery
            </p>

            <h2>
              Active
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📸
          </div>

          <div>

            <p>
              Memories
            </p>

            <h2>
              {loading
                ? "..."
                : gallery.length}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💜
          </div>

          <div>

            <p>
              Tantra Academy
            </p>

            <h2>
              Gallery
            </h2>

          </div>

        </div>

      </div>

      {/* ======================================
          GALLERY SECTION
      ====================================== */}

      <div className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              GALLERY RECORDS
            </p>

            <h2>
              Academy Photos
            </h2>

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="payment-loading">

            Loading gallery...

          </div>

        )}

        {/* ERROR */}

        {!loading &&
          error && (

            <div className="payment-error">

              {error}

            </div>

          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          gallery.length === 0 && (

            <div className="payment-empty">

              <div>
                🖼️
              </div>

              <h2>
                No gallery photos
              </h2>

              <p>
                Add photos to build the academy gallery.
              </p>

            </div>

          )}

        {/* GALLERY GRID */}

        {!loading &&
          !error &&
          gallery.length > 0 && (

            <div className="admin-gallery-grid">

              {gallery.map(
                (item) => (

                  <div
                    className="admin-gallery-card"
                    key={item.id}
                  >

                    {/* IMAGE */}

                    <div className="admin-gallery-image">

                      <img
                        src={item.image}
                        alt={
                          item.title ||
                          "Gallery photo"
                        }
                      />

                    </div>

                    {/* CONTENT */}

                    <div className="admin-gallery-card-content">

                      <span className="admin-gallery-category">

                        {item.category ||
                          "Event"}

                      </span>

                      <h3>
                        {item.title ||
                          "Gallery Photo"}
                      </h3>

                      <button
                        className="admin-delete-btn"
                        onClick={() =>
                          handleDelete(
                            item.id
                          )
                        }
                      >
                        🗑️ Delete
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

export default AdminGallery