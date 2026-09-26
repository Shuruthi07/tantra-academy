import { useEffect, useMemo, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/admin/teachers"

function AdminTeachers() {
  const [teachers, setTeachers] =
    useState([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [deletingId, setDeletingId] =
    useState(null)

  // =====================================================
  // GET TEACHER ID
  // =====================================================

  function getTeacherId(teacher) {
    return (
      teacher?.id ||
      teacher?._id ||
      ""
    )
  }

  // =====================================================
  // JWT HEADERS
  // =====================================================

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

  // =====================================================
  // LOAD TEACHERS
  // =====================================================

  async function loadTeachers() {
    try {
      setLoading(true)
      setError("")

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {
        setError(
          "Your admin session has expired. Please login again."
        )
        return
      }

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
        "Admin teachers:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "You are not authorized to manage teachers."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load teachers."
        )
      }

      setTeachers(
        Array.isArray(
          data.teachers
        )
          ? data.teachers
          : []
      )
    } catch (error) {
      console.error(
        "Teacher loading error:",
        error
      )

      setError(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  async function deleteTeacher(
    teacher
  ) {
    const teacherId =
      getTeacherId(teacher)

    if (!teacherId) {
      alert(
        "Teacher ID is missing."
      )
      return
    }

    const teacherName =
      teacher.name ||
      "this teacher"

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${teacherName}?\n\nThis action cannot be undone.`
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(
        teacherId
      )

      const response =
        await fetch(
          `${API_URL}/${teacherId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      console.log(
        "Delete teacher:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "You are not authorized to delete teachers."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete teacher."
        )
      }

      setTeachers(
        currentTeachers =>
          currentTeachers.filter(
            currentTeacher =>
              String(
                getTeacherId(
                  currentTeacher
                )
              ) !==
              String(teacherId)
          )
      )

      window.dispatchEvent(
        new Event(
          "teachersUpdated"
        )
      )

      alert(
        "Teacher deleted successfully. ✅"
      )
    } catch (error) {
      console.error(
        "Teacher deletion error:",
        error
      )

      alert(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setDeletingId(null)
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadTeachers()
  }, [])

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTeachers =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase()

      if (!searchText) {
        return teachers
      }

      return teachers.filter(
        teacher => {
          const name =
            String(
              teacher.name || ""
            ).toLowerCase()

          const email =
            String(
              teacher.email || ""
            ).toLowerCase()

          const phone =
            String(
              teacher.phone || ""
            ).toLowerCase()

          return (
            name.includes(
              searchText
            ) ||
            email.includes(
              searchText
            ) ||
            phone.includes(
              searchText
            )
          )
        }
      )
    }, [teachers, search])

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-students-page">

      {/* HEADER */}

      <div className="admin-students-header">

        <div>

          <p className="admin-label">
            ADMIN PANEL
          </p>

          <h1>
            Manage Teachers 👨‍🏫
          </h1>

          <span>
            View and manage all teachers
            registered in Tantra Academy.
          </span>

        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadTeachers}
          disabled={loading}
        >
          {loading
            ? "⏳ Loading..."
            : "🔄 Refresh"}
        </button>

      </div>

      {/* TEACHER COUNT */}

      <div className="admin-student-count">

        <div className="admin-count-icon">
          👨‍🏫
        </div>

        <div>

          <p>
            Total Teachers
          </p>

          <h2>
            {teachers.length}
          </h2>

        </div>

      </div>

      {/* TEACHER CARD */}

      <div className="admin-students-card">

        <div className="admin-students-card-header">

          <div>

            <h2>
              Registered Teachers
            </h2>

            <p>
              Teacher accounts stored in MongoDB
            </p>

          </div>

          {/* SEARCH */}

          <div
            style={{
              marginTop: "15px"
            }}
          >
            <input
              type="text"
              value={search}
              onChange={event =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="🔍 Search name, email or phone..."
              style={{
                width: "100%",
                maxWidth: "360px",
                minHeight: "44px",
                padding:
                  "10px 14px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14px"
              }}
            />
          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="admin-loading">

            <div
              style={{
                fontSize: "28px",
                marginBottom: "10px"
              }}
            >
              ⏳
            </div>

            Loading teachers...

          </div>

        )}

        {/* ERROR */}

        {!loading &&
          error && (

            <div className="admin-error">

              {error}

              <button
                type="button"
                onClick={
                  loadTeachers
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
          teachers.length === 0 && (

            <div className="admin-empty">

              <div>
                👨‍🏫
              </div>

              <h3>
                No teachers found
              </h3>

              <p>
                Registered teachers will appear here.
              </p>

            </div>

          )}

        {/* SEARCH EMPTY */}

        {!loading &&
          !error &&
          teachers.length > 0 &&
          filteredTeachers.length === 0 && (

            <div className="admin-empty">

              <div>
                🔍
              </div>

              <h3>
                No matching teachers
              </h3>

              <p>
                Try a different name, email or phone number.
              </p>

            </div>

          )}

        {/* TABLE */}

        {!loading &&
          !error &&
          filteredTeachers.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-students-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Registered
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTeachers.map(
                    (
                      teacher,
                      index
                    ) => {

                      const teacherId =
                        getTeacherId(
                          teacher
                        )

                      const initial =
                        teacher.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "T"

                      return (

                        <tr
                          key={
                            teacherId ||
                            index
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>

                          {/* NAME */}

                          <td>

                            <div className="student-name">

                              <div className="student-avatar">

                                {initial}

                              </div>

                              <strong>
                                {teacher.name ||
                                  "Unknown Teacher"}
                              </strong>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td>
                            {teacher.email ||
                              "—"}
                          </td>

                          {/* PHONE */}

                          <td>
                            {teacher.phone ||
                              "—"}
                          </td>

                          {/* ROLE */}

                          <td>

                            <span className="student-role">
                              {teacher.role ||
                                teacher.accountType ||
                                "Teacher"}
                            </span>

                          </td>

                          {/* REGISTERED */}

                          <td>

                            {teacher.createdAt
                              ? new Date(
                                  teacher.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}

                          </td>

                          {/* DELETE */}

                          <td>

                            <button
                              type="button"
                              className="admin-delete-btn"
                              onClick={() =>
                                deleteTeacher(
                                  teacher
                                )
                              }
                              disabled={
                                deletingId ===
                                teacherId
                              }
                            >
                              {deletingId ===
                              teacherId
                                ? "Deleting..."
                                : "🗑️ Delete"}
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

export default AdminTeachers