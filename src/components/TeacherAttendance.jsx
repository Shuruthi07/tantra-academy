import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"


// ============================================================
// API
// ============================================================

const ATTENDANCE_API =
  "https://tantra-academy-1.onrender.com/api/attendance/"

const STUDENTS_API =
  "https://tantra-academy-1.onrender.com/api/admin/teacher-students"


// ============================================================
// COMPONENT
// ============================================================

function TeacherAttendance() {

  const [searchParams, setSearchParams] =
    useSearchParams()

  const selectedStudentId =
    searchParams.get("studentId") || ""


  // ==========================================================
  // STATE
  // ==========================================================

  const [students, setStudents] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")


  const today =
    new Date()
      .toISOString()
      .split("T")[0]

  const [date, setDate] =
    useState(today)


  // ==========================================================
  // AUTH
  // ==========================================================

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


  // ==========================================================
  // STUDENT FORMAT
  // ==========================================================

  function formatStudent(student) {

    return {

      id:
        student.id ||
        student._id ||
        student.userId,

      name:
        student.name ||
        student.fullName ||
        "Student",

      email:
        student.email || "",

      phone:
        student.phone || "",

      course:
        student.course ||
        student.program ||
        "Music Training",

      attendance:
        Number(
          student.attendance
        ) || 0,

      status:
        student.status === "Absent"
          ? "Absent"
          : "Present"
    }
  }


  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  async function loadStudents() {

    try {

      const response =
        await fetch(
          `${STUDENTS_API}?_=${Date.now()}`,
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
        "Students API:",
        response.status,
        data
      )


      if (
        response.status === 401 ||
        response.status === 403
      ) {

        sessionStorage.removeItem(
          "tantraAuthToken"
        )

        sessionStorage.removeItem(
          "tantraLoggedInUser"
        )

        sessionStorage.removeItem(
          "tantraCurrentUser"
        )

        window.location.href =
          "/login"

        return []
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


      const formatted =
        Array.isArray(
          data.students
        )
          ? data.students.map(
              formatStudent
            )
          : []


      return formatted

    } catch (error) {

      console.error(
        "Student loading error:",
        error
      )

      throw error
    }
  }


  // ==========================================================
  // LOAD EXISTING ATTENDANCE
  // ==========================================================

  async function loadExistingAttendance(
    studentList
  ) {

    try {

      const response =
        await fetch(
          `${ATTENDANCE_API}?date=${encodeURIComponent(
            date
          )}&_=${Date.now()}`,
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
        "Attendance API:",
        response.status,
        data
      )


      if (
        !response.ok ||
        !data.success ||
        !Array.isArray(
          data.attendance
        )
      ) {
        return studentList
      }


      if (
        data.attendance.length === 0
      ) {
        return studentList
      }


      // Map existing attendance
      // by student ID

      const attendanceMap =
        new Map()


      data.attendance.forEach(
        record => {

          const id =
            record.studentId ||
            record.userId ||
            record.id ||
            record._id

          if (id) {

            attendanceMap.set(
              String(id),
              record
            )
          }
        }
      )


      return studentList.map(
        student => {

          const record =
            attendanceMap.get(
              String(student.id)
            )


          if (!record) {
            return student
          }


          return {
            ...student,

            status:
              String(
                record.status || ""
              ).toLowerCase() ===
              "absent"
                ? "Absent"
                : "Present",

            attendance:
              Number(
                record.attendance
              ) || student.attendance
          }
        }
      )

    } catch (error) {

      console.warn(
        "Could not load existing attendance:",
        error
      )

      return studentList
    }
  }


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  async function loadAttendance() {

    try {

      setLoading(true)
      setError("")


      let studentList =
        await loadStudents()


      // If a student was selected
      // from Teacher Students page

      if (
        selectedStudentId
      ) {

        studentList =
          studentList.filter(
            student =>
              String(
                student.id
              ) ===
              String(
                selectedStudentId
              )
          )
      }


      studentList =
        await loadExistingAttendance(
          studentList
        )


      setStudents(
        studentList
      )

    } catch (error) {

      console.error(
        "Attendance loading error:",
        error
      )

      setStudents([])

      setError(
        error.message ||
        "Unable to load attendance."
      )

    } finally {

      setLoading(false)

    }
  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadAttendance()

  }, [
    date,
    selectedStudentId
  ])


  // ==========================================================
  // LISTEN FOR UPDATES
  // ==========================================================

  useEffect(() => {

    function refreshAttendance() {
      loadAttendance()
    }


    window.addEventListener(
      "studentsUpdated",
      refreshAttendance
    )

    window.addEventListener(
      "attendanceUpdated",
      refreshAttendance
    )


    return () => {

      window.removeEventListener(
        "studentsUpdated",
        refreshAttendance
      )

      window.removeEventListener(
        "attendanceUpdated",
        refreshAttendance
      )
    }

  }, [
    date,
    selectedStudentId
  ])


  // ==========================================================
  // TOGGLE ATTENDANCE
  // ==========================================================

  function toggleAttendance(
    studentId
  ) {

    setStudents(
      currentStudents =>
        currentStudents.map(
          student => {

            if (
              String(
                student.id
              ) !==
              String(
                studentId
              )
            ) {
              return student
            }


            return {
              ...student,

              status:
                student.status ===
                "Present"
                  ? "Absent"
                  : "Present"
            }
          }
        )
    )
  }


  // ==========================================================
  // SAVE ATTENDANCE
  // ==========================================================

  async function saveAttendance() {

    if (
      students.length === 0
    ) {

      alert(
        "No students available."
      )

      return
    }


    try {

      setSaving(true)
      setError("")


      const attendanceData =
        students.map(
          student => ({

            studentId:
              String(
                student.id
              ),

            studentName:
              student.name,

            course:
              student.course,

            status:
              student.status,

            attendance:
              Number(
                student.attendance
              ) || 0
          })
        )


      const payload = {

        date: date,

        attendance:
          attendanceData

      }


      console.log(
        "Sending attendance:",
        payload
      )


      const response =
        await fetch(
          ATTENDANCE_API,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify(
                payload
              )
          }
        )


      const data =
        await response.json()


      console.log(
        "Save attendance response:",
        response.status,
        data
      )


      if (
        response.status === 401 ||
        response.status === 403
      ) {

        sessionStorage.removeItem(
          "tantraAuthToken"
        )

        sessionStorage.removeItem(
          "tantraLoggedInUser"
        )

        sessionStorage.removeItem(
          "tantraCurrentUser"
        )

        window.location.href =
          "/login"

        return
      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to save attendance."
        )
      }


      alert(
        "Attendance saved successfully! ✅"
      )


      window.dispatchEvent(
        new Event(
          "attendanceUpdated"
        )
      )


      await loadAttendance()

    } catch (error) {

      console.error(
        "Save attendance error:",
        error
      )

      setError(
        error.message ||
        "Unable to save attendance."
      )

      alert(
        error.message ||
        "Unable to save attendance."
      )

    } finally {

      setSaving(false)

    }
  }


  // ==========================================================
  // SHOW ALL STUDENTS
  // ==========================================================

  function showAllStudents() {

    setSearchParams({})
  }


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalStudents =
    students.length


  const presentStudents =
    students.filter(
      student =>
        student.status ===
        "Present"
    ).length


  const absentStudents =
    students.filter(
      student =>
        student.status ===
        "Absent"
    ).length


  const attendancePercentage =
    totalStudents > 0
      ? Math.round(
          (
            presentStudents /
            totalStudents
          ) * 100
        )
      : 0


  // ==========================================================
  // SELECTED STUDENT
  // ==========================================================

  const selectedStudent =
    selectedStudentId
      ? students.find(
          student =>
            String(
              student.id
            ) ===
            String(
              selectedStudentId
            )
        )
      : null


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="teacher-attendance-page">


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="teacher-page-header">

        <div>

          <p className="teacher-page-eyebrow">
            STUDENT ATTENDANCE
          </p>

          <h1>
            Attendance 📊
          </h1>

          <p>
            Track and manage student attendance.
          </p>

        </div>


        <div className="attendance-date-box">

          <label>
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={
              event =>
                setDate(
                  event.target.value
                )
            }
          />

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "12px",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#be123c",
            fontWeight: "600"
          }}
        >

          ⚠️ {error}

        </div>

      )}


      {/* ====================================================
          SELECTED STUDENT
      ==================================================== */}

      {selectedStudentId && (

        <div
          className="selected-attendance-banner"
          style={{
            marginBottom: "20px",
            padding: "16px 20px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg,#f3e8ff,#ede9fe)",
            border:
              "1px solid #ddd6fe",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "15px"
          }}
        >

          <div>

            <strong
              style={{
                color: "#6d28d9",
                fontSize: "16px"
              }}
            >
              👤 Viewing selected student
            </strong>

            {selectedStudent && (

              <span
                style={{
                  marginLeft: "8px",
                  color: "#4c4560",
                  fontWeight: "700"
                }}
              >
                — {selectedStudent.name}
              </span>

            )}

          </div>


          <button
            type="button"
            onClick={
              showAllStudents
            }
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "9px 16px",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            View All Students
          </button>

        </div>

      )}


      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <div className="attendance-summary-grid">

        <div className="attendance-summary-card">

          <span className="attendance-summary-icon">
            👥
          </span>

          <div>

            <p>
              Total Students
            </p>

            <h2>
              {totalStudents}
            </h2>

          </div>

        </div>


        <div className="attendance-summary-card">

          <span className="attendance-summary-icon">
            🟢
          </span>

          <div>

            <p>
              Present
            </p>

            <h2>
              {presentStudents}
            </h2>

          </div>

        </div>


        <div className="attendance-summary-card">

          <span className="attendance-summary-icon">
            🔴
          </span>

          <div>

            <p>
              Absent
            </p>

            <h2>
              {absentStudents}
            </h2>

          </div>

        </div>


        <div className="attendance-summary-card">

          <span className="attendance-summary-icon">
            📈
          </span>

          <div>

            <p>
              Attendance
            </p>

            <h2>
              {attendancePercentage}%
            </h2>

          </div>

        </div>

      </div>


      {/* ====================================================
          ATTENDANCE CARD
      ==================================================== */}

      <div className="attendance-main-card">

        <div className="attendance-card-header">

          <div>

            <h2>
              {selectedStudentId
                ? "Selected Student Attendance"
                : "Today's Attendance"}
            </h2>

            <p>
              {selectedStudentId
                ? "Mark the selected student's attendance."
                : "Mark students as present or absent."}
            </p>

          </div>


          <button
            type="button"
            className="save-attendance-btn"
            onClick={
              saveAttendance
            }
            disabled={
              saving ||
              loading ||
              students.length === 0
            }
          >

            {saving
              ? "Saving..."
              : "💾 Save Attendance"}

          </button>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div className="attendance-loading">

            <div>
              Loading students...
            </div>

          </div>

        ) : students.length === 0 ? (

          <div className="attendance-empty">

            <div className="attendance-empty-icon">
              👩‍🎓
            </div>

            <h3>
              No students found
            </h3>

            <p>
              {error ||
                "No registered students were found."}
            </p>

          </div>

        ) : (

          <div className="attendance-student-list">

            {students.map(
              (
                student,
                index
              ) => (

                <div
                  className="attendance-student-row"
                  key={
                    student.id ||
                    index
                  }
                >

                  {/* STUDENT */}

                  <div className="attendance-student-info">

                    <div className="attendance-avatar">

                      {student.name
                        ? student.name
                            .charAt(0)
                            .toUpperCase()
                        : "S"}

                    </div>


                    <div>

                      <h3>
                        {student.name}
                      </h3>

                      <p>
                        {student.course}
                      </p>

                    </div>

                  </div>


                  {/* OVERALL */}

                  <div className="attendance-overall">

                    <span>
                      Overall
                    </span>

                    <strong>
                      {student.attendance}%
                    </strong>

                  </div>


                  {/* STATUS */}

                  <button
                    type="button"
                    className={
                      `attendance-status-btn ${
                        student.status ===
                        "Present"
                          ? "present"
                          : "absent"
                      }`
                    }
                    onClick={() =>
                      toggleAttendance(
                        student.id
                      )
                    }
                  >

                    {student.status ===
                    "Present"
                      ? "✓ Present"
                      : "✕ Absent"}

                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  )
}

export default TeacherAttendance