import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const ATTENDANCE_API =
  "https://tantra-academy-1.onrender.com/api/attendance/"

const STUDENTS_API =
  "https://tantra-academy-1.onrender.com/api/admin/students"


function AdminAttendance() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] =
    useState("all")

  const [selectedDate, setSelectedDate] =
    useState("")


  // =====================================================
  // AUTH HEADERS
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
              `Bearer ${token}`
          }
        : {})
    }
  }


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  async function loadStudents() {
    const response = await fetch(
      `${STUDENTS_API}?_=${Date.now()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store"
      }
    )

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleLogout()
      return
    }

    const data =
      await response.json()

    if (
      response.ok &&
      data.success
    ) {
      setStudents(
        Array.isArray(
          data.students
        )
          ? data.students
          : []
      )
    }
  }


  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  async function loadAttendance() {
    try {
      setLoading(true)
      setError("")

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {
        handleLogout()
        return
      }


      await loadStudents()


      const response =
        await fetch(
          `${ATTENDANCE_API}?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleLogout()
        return
      }


      const data =
        await response.json()


      console.log(
        "Admin attendance:",
        data
      )


      if (
        response.ok &&
        data.success
      ) {
        setAttendance(
          Array.isArray(
            data.attendance
          )
            ? data.attendance
            : []
        )
      } else {
        setAttendance([])
        setError(
          data.message ||
          "Unable to load attendance."
        )
      }

    } catch (err) {
      console.error(
        "Attendance loading error:",
        err
      )

      setError(
        "Unable to connect to attendance backend."
      )
    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    sessionStorage.removeItem(
      "tantraAuthToken"
    )

    sessionStorage.removeItem(
      "tantraLoggedInUser"
    )

    sessionStorage.removeItem(
      "tantraCurrentUser"
    )

    navigate(
      "/login",
      {
        replace: true
      }
    )
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadAttendance()
  }, [])


  // =====================================================
  // UPDATE WHEN ATTENDANCE CHANGES
  // =====================================================

  useEffect(() => {
    function handleAttendanceUpdate() {
      loadAttendance()
    }

    window.addEventListener(
      "attendanceUpdated",
      handleAttendanceUpdate
    )

    return () => {
      window.removeEventListener(
        "attendanceUpdated",
        handleAttendanceUpdate
      )
    }
  }, [])


  // =====================================================
  // GET STUDENT ID
  // =====================================================

  function getStudentId(item) {
    return String(
      item.studentId ||
      item.userId ||
      item.student?._id ||
      item.student?.id ||
      ""
    )
  }


  // =====================================================
  // GET STUDENT NAME
  // =====================================================

  function getStudentName(item) {
    return (
      item.studentName ||
      item.name ||
      item.student?.name ||
      "Unknown Student"
    )
  }


  // =====================================================
  // GET ATTENDANCE STATUS
  // =====================================================

  function getStatus(item) {
    const status = String(
      item.status ||
      item.attendance ||
      ""
    )
      .trim()
      .toLowerCase()

    if (
      status === "present" ||
      status === "p"
    ) {
      return "Present"
    }

    if (
      status === "absent" ||
      status === "a"
    ) {
      return "Absent"
    }

    if (
      status === "late" ||
      status === "l"
    ) {
      return "Late"
    }

    return "Not Marked"
  }


  // =====================================================
  // GET DATE
  // =====================================================

  function getDate(item) {
    return (
      item.date ||
      item.attendanceDate ||
      item.createdAt ||
      ""
    )
  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—"
    }

    const date =
      new Date(dateValue)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(dateValue)
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    )
  }


  // =====================================================
  // NORMALIZE ATTENDANCE
  // =====================================================

  const attendanceRecords =
    useMemo(() => {
      return attendance.map(
        item => ({
          ...item,
          normalizedStudentId:
            getStudentId(item),

          normalizedStudentName:
            getStudentName(item),

          normalizedStatus:
            getStatus(item),

          normalizedDate:
            getDate(item)
        })
      )
    }, [attendance])


  // =====================================================
  // FILTER ATTENDANCE
  // =====================================================

  const filteredAttendance =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase()

      return attendanceRecords.filter(
        item => {

          const matchesSearch =
            !searchText ||
            item.normalizedStudentName
              .toLowerCase()
              .includes(searchText)


          const matchesStudent =
            selectedStudent === "all" ||
            item.normalizedStudentId ===
              String(selectedStudent)


          let matchesDate = true

          if (
            selectedDate &&
            item.normalizedDate
          ) {
            const itemDate =
              new Date(
                item.normalizedDate
              )

            if (
              !Number.isNaN(
                itemDate.getTime()
              )
            ) {
              const year =
                itemDate.getFullYear()

              const month =
                String(
                  itemDate.getMonth() + 1
                ).padStart(2, "0")

              const day =
                String(
                  itemDate.getDate()
                ).padStart(2, "0")

              const formatted =
                `${year}-${month}-${day}`

              matchesDate =
                formatted ===
                selectedDate
            }
          }

          return (
            matchesSearch &&
            matchesStudent &&
            matchesDate
          )
        }
      )
    }, [
      attendanceRecords,
      search,
      selectedStudent,
      selectedDate
    ])


  // =====================================================
  // SUMMARY
  // =====================================================

  const totalRecords =
    filteredAttendance.length

  const presentCount =
    filteredAttendance.filter(
      item =>
        item.normalizedStatus ===
        "Present"
    ).length

  const absentCount =
    filteredAttendance.filter(
      item =>
        item.normalizedStatus ===
        "Absent"
    ).length

  const lateCount =
    filteredAttendance.filter(
      item =>
        item.normalizedStatus ===
        "Late"
    ).length


  const attendancePercentage =
    totalRecords > 0
      ? Math.round(
          (presentCount /
            totalRecords) *
            100
        )
      : 0


  // =====================================================
  // STUDENT SUMMARY
  // =====================================================

  const studentSummary =
    useMemo(() => {

      const map = {}

      attendanceRecords.forEach(
        item => {

          const id =
            item.normalizedStudentId

          if (!id) {
            return
          }

          if (!map[id]) {
            map[id] = {
              id,
              name:
                item.normalizedStudentName,
              total: 0,
              present: 0,
              absent: 0,
              late: 0
            }
          }

          map[id].total += 1

          if (
            item.normalizedStatus ===
            "Present"
          ) {
            map[id].present += 1
          }

          if (
            item.normalizedStatus ===
            "Absent"
          ) {
            map[id].absent += 1
          }

          if (
            item.normalizedStatus ===
            "Late"
          ) {
            map[id].late += 1
          }
        }
      )

      return Object.values(
        map
      ).map(item => ({
        ...item,
        percentage:
          item.total > 0
            ? Math.round(
                (item.present /
                  item.total) *
                  100
              )
            : 0
      }))

    }, [attendanceRecords])


  // =====================================================
  // GET INITIAL
  // =====================================================

  function getInitial(name) {
    return String(
      name || "S"
    )
      .trim()
      .charAt(0)
      .toUpperCase()
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-attendance-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-attendance-header">

        <div>

          <p className="admin-label">
            ADMIN PANEL
          </p>

          <h1>
            Attendance Management 📋
          </h1>

          <p>
            View and monitor student
            attendance.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-btn"
          onClick={
            loadAttendance
          }
          disabled={loading}
        >
          {loading
            ? "⏳ Loading..."
            : "🔄 Refresh"}
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="admin-attendance-summary">

        <div className="attendance-summary-card">

          <div className="attendance-summary-icon">
            👥
          </div>

          <div>
            <span>
              Total Records
            </span>

            <strong>
              {totalRecords}
            </strong>
          </div>

        </div>


        <div className="attendance-summary-card present">

          <div className="attendance-summary-icon">
            ✅
          </div>

          <div>
            <span>
              Present
            </span>

            <strong>
              {presentCount}
            </strong>
          </div>

        </div>


        <div className="attendance-summary-card absent">

          <div className="attendance-summary-icon">
            ❌
          </div>

          <div>
            <span>
              Absent
            </span>

            <strong>
              {absentCount}
            </strong>
          </div>

        </div>


        <div className="attendance-summary-card late">

          <div className="attendance-summary-icon">
            ⏰
          </div>

          <div>
            <span>
              Late
            </span>

            <strong>
              {lateCount}
            </strong>
          </div>

        </div>


        <div className="attendance-summary-card percentage">

          <div className="attendance-summary-icon">
            📊
          </div>

          <div>
            <span>
              Attendance
            </span>

            <strong>
              {attendancePercentage}%
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="admin-attendance-filters">

        <div className="attendance-filter-group">

          <label>
            Search Student
          </label>

          <input
            type="text"
            placeholder="Search by student name..."
            value={search}
            onChange={e =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        <div className="attendance-filter-group">

          <label>
            Student
          </label>

          <select
            value={
              selectedStudent
            }
            onChange={e =>
              setSelectedStudent(
                e.target.value
              )
            }
          >

            <option value="all">
              All Students
            </option>

            {students.map(
              student => {

                const id =
                  student.id ||
                  student._id

                return (
                  <option
                    key={id}
                    value={id}
                  >
                    {student.name ||
                      student.fullName ||
                      "Student"}
                  </option>
                )
              }
            )}

          </select>

        </div>


        <div className="attendance-filter-group">

          <label>
            Date
          </label>

          <input
            type="date"
            value={
              selectedDate
            }
            onChange={e =>
              setSelectedDate(
                e.target.value
              )
            }
          />

        </div>


        <button
          type="button"
          className="attendance-clear-btn"
          onClick={() => {
            setSearch("")
            setSelectedStudent(
              "all"
            )
            setSelectedDate("")
          }}
        >
          Clear Filters
        </button>

      </div>


      {/* =================================================
          STUDENT SUMMARY
      ================================================= */}

      <div className="admin-attendance-card">

        <div className="admin-attendance-card-header">

          <div>

            <p className="admin-label">
              STUDENT SUMMARY
            </p>

            <h2>
              Attendance by Student
            </h2>

          </div>

        </div>


        {studentSummary.length === 0 ? (

          <div className="admin-empty">
            No attendance records available.
          </div>

        ) : (

          <div className="attendance-student-grid">

            {studentSummary
              .filter(student => {

                if (
                  selectedStudent ===
                  "all"
                ) {
                  return true
                }

                return (
                  student.id ===
                  String(
                    selectedStudent
                  )
                )
              })
              .map(student => (

                <div
                  className="attendance-student-card"
                  key={student.id}
                >

                  <div className="attendance-student-top">

                    <div className="student-avatar">
                      {getInitial(
                        student.name
                      )}
                    </div>

                    <div>

                      <h3>
                        {student.name}
                      </h3>

                      <span>
                        {student.total} attendance
                        record
                        {student.total !== 1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                  </div>


                  <div className="attendance-progress">

                    <div className="attendance-progress-header">

                      <span>
                        Attendance
                      </span>

                      <strong>
                        {student.percentage}%
                      </strong>

                    </div>

                    <div className="attendance-progress-bar">

                      <div
                        className="attendance-progress-fill"
                        style={{
                          width:
                            `${student.percentage}%`
                        }}
                      />

                    </div>

                  </div>


                  <div className="attendance-mini-stats">

                    <span className="mini-present">
                      ✓ {student.present}
                    </span>

                    <span className="mini-absent">
                      ✕ {student.absent}
                    </span>

                    <span className="mini-late">
                      ⏰ {student.late}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        )}

      </div>


      {/* =================================================
          ATTENDANCE TABLE
      ================================================= */}

      <div className="admin-attendance-card">

        <div className="admin-attendance-card-header">

          <div>

            <p className="admin-label">
              ATTENDANCE RECORDS
            </p>

            <h2>
              Daily Attendance
            </h2>

          </div>

          <span className="attendance-record-count">
            {filteredAttendance.length} records
          </span>

        </div>


        {loading ? (

          <div className="admin-loading">
            Loading attendance...
          </div>

        ) : filteredAttendance.length === 0 ? (

          <div className="admin-empty">
            No attendance records found.
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-attendance-table">

              <thead>

                <tr>

                  <th>
                    Student
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Course
                  </th>

                  <th>
                    Notes
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredAttendance.map(
                  (item, index) => {

                    const status =
                      item.normalizedStatus

                    return (

                      <tr
                        key={
                          item.id ||
                          item._id ||
                          `${item.normalizedStudentId}-${item.normalizedDate}-${index}`
                        }
                      >

                        <td>

                          <div className="attendance-table-student">

                            <div className="student-avatar">
                              {getInitial(
                                item.normalizedStudentName
                              )}
                            </div>

                            <strong>
                              {
                                item.normalizedStudentName
                              }
                            </strong>

                          </div>

                        </td>


                        <td>
                          {formatDate(
                            item.normalizedDate
                          )}
                        </td>


                        <td>

                          <span
                            className={
                              status ===
                              "Present"
                                ? "attendance-status present"
                                : status ===
                                  "Absent"
                                ? "attendance-status absent"
                                : status ===
                                  "Late"
                                ? "attendance-status late"
                                : "attendance-status"
                            }
                          >

                            {status ===
                            "Present"
                              ? "✓ Present"
                              : status ===
                                "Absent"
                              ? "✕ Absent"
                              : status ===
                                "Late"
                              ? "⏰ Late"
                              : "— Not Marked"}

                          </span>

                        </td>


                        <td>
                          {item.course ||
                            item.subject ||
                            item.className ||
                            "—"}
                        </td>


                        <td>
                          {item.notes ||
                            item.remarks ||
                            "—"}
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


      {/* =================================================
          BACK TO DASHBOARD
      ================================================= */}

      <button
        type="button"
        className="admin-back-btn"
        onClick={() =>
          navigate(
            "/admin-dashboard"
          )
        }
      >
        ← Back to Admin Dashboard
      </button>

    </div>
  )
}

export default AdminAttendance