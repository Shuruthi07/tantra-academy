import { useEffect, useMemo, useState } from "react"

const API_URL =
  "http://127.0.0.1:5000/api/admin/students"

function AdminStudents() {
  const [students, setStudents] =
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
  // GET STUDENT ID
  // =====================================================

  function getStudentId(student) {
    return (
      student?.id ||
      student?._id ||
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
  // LOAD STUDENTS
  // =====================================================

  async function loadStudents() {
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
        "Admin students:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "You are not authorized to manage students."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load students."
        )
      }

      setStudents(
        Array.isArray(
          data.students
        )
          ? data.students
          : []
      )

    } catch (error) {
      console.error(
        "Student loading error:",
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
  // DELETE STUDENT
  // =====================================================

  async function deleteStudent(
    student
  ) {
    const studentId =
      getStudentId(student)

    if (!studentId) {
      alert(
        "Student ID is missing."
      )
      return
    }

    const studentName =
      student.name ||
      "this student"

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${studentName}?\n\nThis action cannot be undone.`
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(
        studentId
      )

      const response =
        await fetch(
          `${API_URL}/${studentId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      console.log(
        "Delete student:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "You are not authorized to delete students."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete student."
        )
      }

      setStudents(
        currentStudents =>
          currentStudents.filter(
            currentStudent =>
              String(
                getStudentId(
                  currentStudent
                )
              ) !==
              String(studentId)
          )
      )

      window.dispatchEvent(
        new Event(
          "studentsUpdated"
        )
      )

      alert(
        "Student deleted successfully. ✅"
      )

    } catch (error) {
      console.error(
        "Student deletion error:",
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
    loadStudents()
  }, [])

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredStudents =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase()

      if (!searchText) {
        return students
      }

      return students.filter(
        student => {
          const name =
            String(
              student.name || ""
            ).toLowerCase()

          const email =
            String(
              student.email || ""
            ).toLowerCase()

          const phone =
            String(
              student.phone || ""
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
    }, [students, search])

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
            Manage Students 👨‍🎓
          </h1>

          <span>
            View and manage all students
            registered in Tantra Academy.
          </span>

        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadStudents}
          disabled={loading}
        >
          {loading
            ? "⏳ Loading..."
            : "🔄 Refresh"}
        </button>

      </div>

      {/* COUNT */}

      <div className="admin-student-count">

        <div className="admin-count-icon">
          👨‍🎓
        </div>

        <div>

          <p>
            Total Students
          </p>

          <h2>
            {students.length}
          </h2>

        </div>

      </div>

      {/* STUDENTS CARD */}

      <div className="admin-students-card">

        <div className="admin-students-card-header">

          <div>

            <h2>
              Registered Students
            </h2>

            <p>
              Student accounts stored in MongoDB
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

            Loading students...

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
                  loadStudents
                }
                style={{
                  marginLeft: "12px"
                }}
              >
                Retry
              </button>

            </div>

          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          students.length === 0 && (

            <div className="admin-empty">

              <div>
                👨‍🎓
              </div>

              <h3>
                No students found
              </h3>

              <p>
                Registered students will appear here.
              </p>

            </div>

          )}

        {/* SEARCH EMPTY */}

        {!loading &&
          !error &&
          students.length > 0 &&
          filteredStudents.length === 0 && (

            <div className="admin-empty">

              <div>
                🔍
              </div>

              <h3>
                No matching students
              </h3>

              <p>
                Try a different name, email or phone number.
              </p>

            </div>

          )}

        {/* TABLE */}

        {!loading &&
          !error &&
          filteredStudents.length > 0 && (

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

                  {filteredStudents.map(
                    (
                      student,
                      index
                    ) => {

                      const studentId =
                        getStudentId(
                          student
                        )

                      const initial =
                        student.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "S"

                      return (

                        <tr
                          key={
                            studentId ||
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
                                {student.name ||
                                  "Unknown Student"}
                              </strong>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td>
                            {student.email ||
                              "—"}
                          </td>

                          {/* PHONE */}

                          <td>
                            {student.phone ||
                              "—"}
                          </td>

                          {/* ROLE */}

                          <td>

                            <span className="student-role">
                              {student.role ||
                                student.accountType ||
                                "Student"}
                            </span>

                          </td>

                          {/* REGISTERED */}

                          <td>

                            {student.createdAt
                              ? new Date(
                                  student.createdAt
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
                                deleteStudent(
                                  student
                                )
                              }
                              disabled={
                                deletingId ===
                                studentId
                              }
                            >

                              {deletingId ===
                              studentId
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

export default AdminStudents