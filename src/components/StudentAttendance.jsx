import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/attendance/"

function StudentAttendance() {

  const [attendance, setAttendance] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  // =====================================================
  // GET LOGIN USER
  // =====================================================

  const getCurrentUser = () => {

    try {

      const user =
        JSON.parse(
          sessionStorage.getItem(
            "tantraCurrentUser"
          ) || "{}"
        )

      return user

    } catch {

      return {}

    }

  }


  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getAuthHeaders = () => {

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
  // LOAD ATTENDANCE
  // =====================================================

  const loadAttendance =
    async () => {

      try {

        setLoading(true)
        setError("")


        const user =
          getCurrentUser()


        const studentId =
          user.id ||
          user._id ||
          user.userId


        if (!studentId) {

          setError(
            "Student information not found."
          )

          setAttendance([])

          return

        }


        const response =
          await fetch(
            `${API_URL}?studentId=${encodeURIComponent(
              studentId
            )}`,
            {
              method: "GET",
              headers:
                getAuthHeaders()
            }
          )


        const data =
          await response.json()


        console.log(
          "Student attendance:",
          response.status,
          data
        )


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            "Unable to load attendance."
          )

        }


        setAttendance(
          Array.isArray(
            data.attendance
          )
            ? data.attendance
            : []
        )

      } catch (error) {

        console.error(
          "Student attendance error:",
          error
        )

        setError(
          error.message ||
          "Unable to load attendance."
        )

        setAttendance([])

      } finally {

        setLoading(false)

      }

    }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadAttendance()


    const handleAttendanceUpdate =
      () => {

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
  // CALCULATE SUMMARY
  // =====================================================

  const totalClasses =
    attendance.length


  const presentClasses =
    attendance.filter(
      item =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "present"
    ).length


  const absentClasses =
    attendance.filter(
      item =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "absent"
    ).length


  const percentage =
    totalClasses > 0
      ? Math.round(
          (
            presentClasses /
            totalClasses
          ) * 100
        )
      : 0


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="student-attendance-page">


      {/* HEADER */}

      <div className="student-attendance-header">

        <div>

          <p>
            ATTENDANCE
          </p>

          <h1>
            My Attendance 📊
          </h1>

          <span>
            Track your class attendance and
            attendance history.
          </span>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="student-attendance-error">

          ⚠️ {error}

        </div>

      )}


      {/* SUMMARY */}

      <div className="student-attendance-summary">


        <div className="student-attendance-summary-card">

          <div className="attendance-summary-icon">
            📊
          </div>

          <div>

            <span>
              Overall Attendance
            </span>

            <h2>
              {percentage}%
            </h2>

          </div>

        </div>


        <div className="student-attendance-summary-card">

          <div className="attendance-summary-icon">
            📚
          </div>

          <div>

            <span>
              Total Classes
            </span>

            <h2>
              {totalClasses}
            </h2>

          </div>

        </div>


        <div className="student-attendance-summary-card">

          <div className="attendance-summary-icon">
            🟢
          </div>

          <div>

            <span>
              Present
            </span>

            <h2>
              {presentClasses}
            </h2>

          </div>

        </div>


        <div className="student-attendance-summary-card">

          <div className="attendance-summary-icon">
            🔴
          </div>

          <div>

            <span>
              Absent
            </span>

            <h2>
              {absentClasses}
            </h2>

          </div>

        </div>

      </div>


      {/* ATTENDANCE CARD */}

      <div className="student-attendance-card">


        <div className="student-attendance-card-header">

          <div>

            <p>
              ATTENDANCE HISTORY
            </p>

            <h2>
              Class Attendance
            </h2>

          </div>

        </div>


        {loading ? (

          <div className="student-attendance-empty">

            <div>
              ⏳
            </div>

            <h3>
              Loading attendance...
            </h3>

            <p>
              Please wait.
            </p>

          </div>

        ) : attendance.length === 0 ? (

          <div className="student-attendance-empty">

            <div>
              📅
            </div>

            <h3>
              No attendance records yet
            </h3>

            <p>
              Your attendance records will
              appear here after your teacher
              marks attendance.
            </p>

          </div>

        ) : (

          <div className="student-attendance-list">


            {attendance.map(
              (record, index) => (

                <div
                  className="student-attendance-row"
                  key={
                    record.id ||
                    record._id ||
                    index
                  }
                >


                  <div className="student-attendance-date">

                    <span>
                      📅
                    </span>

                    <div>

                      <strong>
                        {record.date ||
                          record.attendanceDate ||
                          "Class"}
                      </strong>

                      <small>
                        {record.course ||
                          "Music Training"}
                      </small>

                    </div>

                  </div>


                  <div>

                    <span
                      className={
                        String(
                          record.status ||
                          ""
                        ).toLowerCase() ===
                        "present"
                          ? "attendance-present"
                          : "attendance-absent"
                      }
                    >

                      {String(
                        record.status ||
                        "Not Marked"
                      ).toLowerCase() ===
                      "present"
                        ? "✓ Present"
                        : "✕ Absent"}

                    </span>

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

export default StudentAttendance