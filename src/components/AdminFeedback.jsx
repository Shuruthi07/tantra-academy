import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminFeedback() {

  const navigate = useNavigate()

  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const API_URL =
    "https://tantra-academy-1.onrender.com/api/feedback"

  // ========================================
  // JWT AUTH HEADERS
  // ========================================

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

  // ========================================
  // LOAD FEEDBACK
  // ========================================

  async function loadFeedback() {

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
          "Unable to load feedback."
        )

      }

      setFeedback(
        Array.isArray(data.feedback)
          ? data.feedback
          : []
      )

    } catch (error) {

      console.error(
        "Admin feedback error:",
        error
      )

      setError(
        error.message ||
        "Unable to load feedback."
      )

      setFeedback([])

    } finally {

      setLoading(false)

    }

  }

  // ========================================
  // LOAD WHEN PAGE OPENS
  // ========================================

  useEffect(() => {

    loadFeedback()

  }, [])

  // ========================================
  // DELETE FEEDBACK
  // ========================================

  async function handleDelete(
    feedbackId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this feedback?"
      )

    if (!confirmed) {
      return
    }

    try {

      const response =
        await fetch(
          `${API_URL}/${feedbackId}`,
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
          "Unable to delete feedback."
        )

      }

      setFeedback(
        previous =>
          previous.filter(
            item =>
              item.id !== feedbackId
          )
      )

      alert(
        "Feedback deleted successfully."
      )

    } catch (error) {

      console.error(
        "Delete feedback error:",
        error
      )

      alert(
        error.message ||
        "Unable to delete feedback."
      )

    }

  }

  // ========================================
  // FORMAT DATE
  // ========================================

  function formatDate(value) {

    if (!value) {
      return "-"
    }

    try {

      const date =
        new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return value
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )

    } catch {

      return value

    }

  }

  // ========================================
  // RATING
  // ========================================

  function renderRating(rating) {

    const value =
      Number(rating || 0)

    if (!value) {
      return "No rating"
    }

    return (
      <div className="admin-feedback-rating">

        {"★".repeat(
          Math.min(value, 5)
        )}

        <span>
          {"☆".repeat(
            Math.max(
              0,
              5 - value
            )
          )}
        </span>

      </div>
    )

  }

  // ========================================
  // STATISTICS
  // ========================================

  const totalFeedback =
    feedback.length

  const respondedFeedback =
    feedback.filter(
      item =>
        item.response ||
        item.teacherResponse ||
        item.reply
    ).length

  const pendingFeedback =
    totalFeedback -
    respondedFeedback

  // ========================================
  // PAGE
  // ========================================

  return (

    <div className="admin-dashboard">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="admin-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Feedback Management 💬
          </h1>

          <span>
            View and manage student feedback.
          </span>

        </div>

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

      </div>

      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="admin-stats">

        {/* TOTAL */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💬
          </div>

          <div>

            <p>
              Total Feedback
            </p>

            <h2>
              {loading
                ? "..."
                : totalFeedback}
            </h2>

          </div>

        </div>

        {/* RESPONDED */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ✅
          </div>

          <div>

            <p>
              Responded
            </p>

            <h2>
              {loading
                ? "..."
                : respondedFeedback}
            </h2>

          </div>

        </div>

        {/* PENDING */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⏳
          </div>

          <div>

            <p>
              Pending
            </p>

            <h2>
              {loading
                ? "..."
                : pendingFeedback}
            </h2>

          </div>

        </div>

        {/* RECORDS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📋
          </div>

          <div>

            <p>
              Records
            </p>

            <h2>
              {loading
                ? "..."
                : totalFeedback}
            </h2>

          </div>

        </div>

      </div>

      {/* ========================================
          FEEDBACK SECTION
      ======================================== */}

      <div className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              STUDENT VOICE
            </p>

            <h2>
              Student Feedback
            </h2>

          </div>

          <button
            className="admin-refresh-btn"
            onClick={loadFeedback}
          >
            🔄 Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (

          <div className="admin-feedback-error">

            ⚠️ {error}

          </div>

        )}

        {/* LOADING */}

        {loading && (

          <div className="admin-feedback-empty">

            <div>
              ⏳
            </div>

            <h3>
              Loading feedback...
            </h3>

            <p>
              Please wait while feedback is loaded.
            </p>

          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          feedback.length === 0 && (

            <div className="admin-feedback-empty">

              <div>
                💬
              </div>

              <h3>
                No feedback yet
              </h3>

              <p>
                Student feedback will appear here.
              </p>

            </div>

          )}

        {/* FEEDBACK TABLE */}

        {!loading &&
          feedback.length > 0 && (

            <div className="admin-feedback-table-wrapper">

              <table className="admin-feedback-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Rating
                    </th>

                    <th>
                      Feedback
                    </th>

                    <th>
                      Response
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {feedback.map(
                    item => {

                      const studentName =
                        item.studentName ||
                        item.name ||
                        "Student"

                      const message =
                        item.message ||
                        item.feedback ||
                        item.comment ||
                        "-"

                      const response =
                        item.response ||
                        item.teacherResponse ||
                        item.reply ||
                        ""

                      const rating =
                        item.rating ||
                        item.stars ||
                        0

                      return (

                        <tr
                          key={item.id}
                        >

                          {/* STUDENT */}

                          <td>

                            <div className="admin-feedback-student">

                              <div className="admin-feedback-avatar">
                                👨‍🎓
                              </div>

                              <div>

                                <strong>
                                  {studentName}
                                </strong>

                                <small>
                                  {item.studentId
                                    ? `ID: ${item.studentId}`
                                    : "Student"}
                                </small>

                              </div>

                            </div>

                          </td>

                          {/* RATING */}

                          <td>

                            {renderRating(
                              rating
                            )}

                          </td>

                          {/* FEEDBACK */}

                          <td>

                            <div className="admin-feedback-message">

                              {message}

                            </div>

                          </td>

                          {/* RESPONSE */}

                          <td>

                            {response ? (

                              <div className="admin-feedback-response">

                                <span>
                                  💬
                                </span>

                                <p>
                                  {response}
                                </p>

                              </div>

                            ) : (

                              <span className="admin-feedback-pending">

                                Pending

                              </span>

                            )}

                          </td>

                          {/* DATE */}

                          <td>

                            <span className="admin-feedback-date">

                              {formatDate(
                                item.createdAt ||
                                item.date
                              )}

                            </span>

                          </td>

                          {/* DELETE */}

                          <td>

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

                          </td>

                        </tr>

                      )

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>

  )

}

export default AdminFeedback