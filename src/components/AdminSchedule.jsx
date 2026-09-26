import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminSchedule() {

  const navigate = useNavigate()

  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const API_URL =
    "https://tantra-academy-1.onrender.com/api/schedule/"

  // ==========================================
  // JWT AUTH HEADERS
  // ==========================================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization:
              "Bearer " + token
          }
        : {})
    }
  }

  // ==========================================
  // LOAD SCHEDULE
  // ==========================================

  async function loadSchedule() {

    try {

      setLoading(true)
      setError("")

      const response =
        await fetch(
          API_URL,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      console.log(
        "Admin schedule:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to load schedule."
        )
      }

      setSchedule(
        Array.isArray(
          data.schedule
        )
          ? data.schedule
          : []
      )

    } catch (error) {

      console.error(
        "Admin schedule error:",
        error
      )

      setError(
        error.message ||
        "Unable to load schedule."
      )

      setSchedule([])

    } finally {

      setLoading(false)

    }
  }

  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadSchedule()

    const handleScheduleUpdate =
      () => {
        loadSchedule()
      }

    window.addEventListener(
      "scheduleUpdated",
      handleScheduleUpdate
    )

    return () => {

      window.removeEventListener(
        "scheduleUpdated",
        handleScheduleUpdate
      )

    }

  }, [])

  // ==========================================
  // DELETE SCHEDULE
  // ==========================================

  async function handleDelete(id) {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this class?"
      )

    if (!confirmDelete) {
      return
    }

    try {

      const response =
        await fetch(
          `${API_URL}${id}`,
          {
            method: "DELETE",

            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      console.log(
        "Delete schedule:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to delete class."
        )
      }

      setSchedule(
        previous =>
          previous.filter(
            item =>
              String(
                item.id
              ) !==
              String(id)
          )
      )

      window.dispatchEvent(
        new Event(
          "scheduleUpdated"
        )
      )

      alert(
        "Class deleted successfully."
      )

    } catch (error) {

      console.error(
        "Delete schedule error:",
        error
      )

      alert(
        error.message ||
        "Unable to delete class."
      )
    }
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

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

  // ==========================================
  // GET DAY
  // ==========================================

  function getDay(value) {

    if (!value) {
      return ""
    }

    try {

      const date =
        new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return ""
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          weekday: "short"
        }
      )

    } catch {

      return ""

    }
  }

  // ==========================================
  // GET MONTH
  // ==========================================

  function getMonth(value) {

    if (!value) {
      return ""
    }

    try {

      const date =
        new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return ""
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          month: "short"
        }
      )

    } catch {

      return ""

    }
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="admin-dashboard">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="admin-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Schedule Management 📅
          </h1>

          <span>
            View and manage academy classes and schedules.
          </span>

        </div>

      </div>

      {/* ==========================================
          ACTIONS
      ========================================== */}

      <div className="admin-schedule-actions">

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
          className="admin-back-btn"
          onClick={
            loadSchedule
          }
        >
          🔄 Refresh
        </button>

      </div>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="admin-stats">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📅
          </div>

          <div>

            <p>
              Total Classes
            </p>

            <h2>
              {loading
                ? "..."
                : schedule.length}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🎵
          </div>

          <div>

            <p>
              Music Classes
            </p>

            <h2>
              {loading
                ? "..."
                : schedule.length}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🕐
          </div>

          <div>

            <p>
              Scheduled
            </p>

            <h2>
              {loading
                ? "..."
                : schedule.length}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🏫
          </div>

          <div>

            <p>
              Academy
            </p>

            <h2>
              Active
            </h2>

          </div>

        </div>

      </div>

      {/* ==========================================
          SCHEDULE
      ========================================== */}

      <div className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              CLASS SCHEDULE
            </p>

            <h2>
              Academy Classes
            </h2>

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="payment-loading">
            Loading schedule...
          </div>

        )}

        {/* ERROR */}

        {!loading &&
          error && (

            <div className="payment-error">

              ⚠️ {error}

              <button
                onClick={
                  loadSchedule
                }
                style={{
                  marginLeft:
                    "12px"
                }}
              >
                Retry
              </button>

            </div>

          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          schedule.length === 0 && (

            <div className="payment-empty">

              <div>
                📅
              </div>

              <h2>
                No classes scheduled
              </h2>

              <p>
                Teacher schedules will appear here.
              </p>

            </div>

          )}

        {/* TABLE */}

        {!loading &&
          !error &&
          schedule.length > 0 && (

            <div className="admin-schedule-table-wrapper">

              <table className="admin-schedule-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Class
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Room
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {schedule.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={
                          item.id ||
                          item._id ||
                          index
                        }
                      >

                        {/* DATE */}

                        <td>

                          <strong>
                            {item.day ||
                              getDay(
                                item.date
                              ) ||
                              "-"}
                          </strong>

                          <small>
                            {item.month ||
                              getMonth(
                                item.date
                              )}
                          </small>

                          <small>
                            {formatDate(
                              item.date
                            )}
                          </small>

                        </td>

                        {/* TIME */}

                        <td>

                          <span className="admin-time-badge">

                            🕐{" "}

                            {item.time ||
                              "-"}

                          </span>

                        </td>

                        {/* CLASS */}

                        <td>

                          <strong>
                            {item.title ||
                              item.className ||
                              "Class"}
                          </strong>

                        </td>

                        {/* COURSE */}

                        <td>

                          <span className="admin-course-badge">

                            🎵{" "}

                            {item.course ||
                              item.program ||
                              "-"}

                          </span>

                        </td>

                        {/* STUDENT */}

                        <td>

                          <span className="admin-course-badge">

                            👤{" "}

                            {item.studentName ||
                              item.student ||
                              "All Students"}

                          </span>

                        </td>

                        {/* ROOM */}

                        <td>

                          <span className="admin-room-badge">

                            🏫{" "}

                            {item.room ||
                              "-"}

                          </span>

                        </td>

                        {/* DELETE */}

                        <td>

                          <button
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDelete(
                                item.id ||
                                item._id
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>

  )
}

export default AdminSchedule