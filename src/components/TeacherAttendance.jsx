import { useEffect, useState } from "react"

function TeacherAttendance() {

  // ==============================
  // DEFAULT STUDENTS
  // ==============================

  const defaultStudents = [
    {
      id: 1,
      name: "Arun Kumar",
      course: "Vocal Training",
      attendance: 95,
      status: "Present"
    },
    {
      id: 2,
      name: "Priya Sharma",
      course: "Piano",
      attendance: 91,
      status: "Present"
    },
    {
      id: 3,
      name: "Rahul Raj",
      course: "Guitar",
      attendance: 82,
      status: "Absent"
    },
    {
      id: 4,
      name: "Ananya S",
      course: "Vocal Training",
      attendance: 96,
      status: "Present"
    },
    {
      id: 5,
      name: "Karthik M",
      course: "Guitar",
      attendance: 88,
      status: "Present"
    },
    {
      id: 6,
      name: "Meena Devi",
      course: "Piano",
      attendance: 93,
      status: "Present"
    }
  ]


  // ==============================
  // ATTENDANCE STATE
  // ==============================

  const [students, setStudents] = useState(() =>
    JSON.parse(
      localStorage.getItem("tantraAttendance")
    ) || defaultStudents
  )


  const [saved, setSaved] = useState(false)


  // ==============================
  // CURRENT DATE
  // ==============================

  const today = new Date()

  const formattedDate =
    today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })


  // ==============================
  // LOAD ATTENDANCE
  // ==============================

  useEffect(() => {

    function loadAttendance() {

      const savedAttendance =
        JSON.parse(
          localStorage.getItem("tantraAttendance")
        )


      if (savedAttendance) {
        setStudents(savedAttendance)
      }

    }


    window.addEventListener(
      "storage",
      loadAttendance
    )


    window.addEventListener(
      "attendanceUpdated",
      loadAttendance
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadAttendance
      )


      window.removeEventListener(
        "attendanceUpdated",
        loadAttendance
      )

    }

  }, [])


  // ==============================
  // SYNC NEW STUDENTS
  // ==============================

  useEffect(() => {

    function syncStudents() {

      const academyStudents =
        JSON.parse(
          localStorage.getItem("tantraStudents")
        ) || []


      if (academyStudents.length === 0) {
        return
      }


      setStudents((currentStudents) => {

        const updatedStudents =
          [...currentStudents]


        academyStudents.forEach((newStudent) => {

          const existingStudent =
            updatedStudents.find(
              (student) =>
                student.id === newStudent.id ||
                student.name === newStudent.name
            )


          if (!existingStudent) {

            updatedStudents.push({
              id: newStudent.id,
              name: newStudent.name,
              course: newStudent.course,
              attendance: Number(
                newStudent.attendance || 0
              ),
              status: "Present"
            })

          }

        })


        return updatedStudents

      })

    }


    window.addEventListener(
      "studentsUpdated",
      syncStudents
    )


    window.addEventListener(
      "storage",
      syncStudents
    )


    return () => {

      window.removeEventListener(
        "studentsUpdated",
        syncStudents
      )


      window.removeEventListener(
        "storage",
        syncStudents
      )

    }

  }, [])


  // ==============================
  // CHANGE PRESENT / ABSENT
  // ==============================

  function toggleAttendance(id) {

    setStudents((currentStudents) =>

      currentStudents.map((student) => {

        if (student.id === id) {

          return {
            ...student,

            status:
              student.status === "Present"
                ? "Absent"
                : "Present"
          }

        }

        return student

      })

    )


    setSaved(false)

  }


  // ==============================
  // PRESENT COUNT
  // ==============================

  const presentCount =
    students.filter(
      (student) =>
        student.status === "Present"
    ).length


  // ==============================
  // ABSENT COUNT
  // ==============================

  const absentCount =
    students.length - presentCount


  // ==============================
  // ATTENDANCE PERCENTAGE
  // ==============================

  const attendancePercentage =
    students.length > 0
      ? Math.round(
          (presentCount /
            students.length) *
          100
        )
      : 0


  // ==============================
  // SAVE ATTENDANCE
  // ==============================

  function saveAttendance() {

    localStorage.setItem(
      "tantraAttendance",
      JSON.stringify(students)
    )


    window.dispatchEvent(
      new Event("attendanceUpdated")
    )


    window.dispatchEvent(
      new Event("studentsUpdated")
    )


    setSaved(true)

  }


  // ==============================
  // PAGE
  // ==============================

  return (

    <div className="teacher-attendance-page">


      {/* ==============================
          HEADER
      ============================== */}

      <div className="teacher-attendance-header">

        <div>

          <p>
            STUDENT ATTENDANCE
          </p>


          <h1>
            Attendance 📊
          </h1>


          <span>
            Mark and monitor student attendance.
          </span>

        </div>


        <div className="attendance-date">
          📅 {formattedDate}
        </div>

      </div>


      {/* ==============================
          SUMMARY
      ============================== */}

      <div className="attendance-summary">


        <div className="attendance-summary-card">

          <span>
            Total Students
          </span>

          <h2>
            {students.length}
          </h2>

          <p>
            Today's class
          </p>

        </div>


        <div className="attendance-summary-card">

          <span>
            Present
          </span>

          <h2>
            {presentCount}
          </h2>

          <p>
            Students present
          </p>

        </div>


        <div className="attendance-summary-card">

          <span>
            Absent
          </span>

          <h2>
            {absentCount}
          </h2>

          <p>
            Students absent
          </p>

        </div>


        <div className="attendance-summary-card">

          <span>
            Attendance
          </span>

          <h2>
            {attendancePercentage}%
          </h2>

          <p>
            Today's attendance
          </p>

        </div>

      </div>


      {/* ==============================
          ATTENDANCE CARD
      ============================== */}

      <div className="attendance-card">


        <div className="attendance-card-header">

          <div>

            <p>
              ALL COURSES
            </p>

            <h2>
              Today's Attendance
            </h2>

          </div>


          <button
            className="save-attendance-btn"
            onClick={saveAttendance}
          >
            💾 Save Attendance
          </button>

        </div>


        {/* ==============================
            SUCCESS MESSAGE
        ============================== */}

        {saved && (

          <div className="attendance-success">
            ✓ Attendance saved successfully!
          </div>

        )}


        {/* ==============================
            STUDENT LIST
        ============================== */}

        <div className="attendance-list">


          <div className="attendance-list-head">

            <span>
              Student
            </span>

            <span>
              Course
            </span>

            <span>
              Overall Attendance
            </span>

            <span>
              Today's Status
            </span>

          </div>


          {students.length === 0 ? (

            <div className="no-feedback">

              <h2>
                No students yet
              </h2>

              <p>
                Add students from the Students page.
              </p>

            </div>

          ) : (

            students.map((student) => (

              <div
                className="attendance-row"
                key={student.id}
              >


                <div className="attendance-student">

                  <div className="attendance-avatar">
                    👤
                  </div>

                  <strong>
                    {student.name}
                  </strong>

                </div>


                <span>
                  {student.course}
                </span>


                <strong>
                  {student.attendance}%
                </strong>


                <button
                  className={
                    student.status === "Present"
                      ? "present-btn"
                      : "absent-btn"
                  }
                  onClick={() =>
                    toggleAttendance(
                      student.id
                    )
                  }
                >

                  {student.status === "Present"
                    ? "✓ Present"
                    : "✕ Absent"}

                </button>

              </div>

            ))

          )}

        </div>

      </div>

    </div>

  )

}

export default TeacherAttendance