
import { useEffect, useState } from "react"

const initialStudents = [
  {
    name: "Arun Kumar",
    course: "Vocal Training",
    attendance: "95%",
    fee: "Paid",
    progress: "85%"
  },
  {
    name: "Priya Sharma",
    course: "Piano",
    attendance: "91%",
    fee: "Paid",
    progress: "78%"
  },
  {
    name: "Rahul Raj",
    course: "Guitar",
    attendance: "82%",
    fee: "Pending",
    progress: "65%"
  },
  {
    name: "Ananya S",
    course: "Vocal Training",
    attendance: "96%",
    fee: "Paid",
    progress: "90%"
  },
  {
    name: "Karthik M",
    course: "Guitar",
    attendance: "88%",
    fee: "Pending",
    progress: "72%"
  },
  {
    name: "Meena Devi",
    course: "Piano",
    attendance: "93%",
    fee: "Paid",
    progress: "81%"
  }
]


function TeacherStudents() {

  const [search, setSearch] = useState("")

  const [studentList, setStudentList] =
    useState([])

  const [showAddForm, setShowAddForm] =
    useState(false)

  const [selectedStudent, setSelectedStudent] =
    useState(null)

  const [newStudent, setNewStudent] = useState({
    name: "",
    course: "",
    attendance: "0%",
    fee: "Pending",
    progress: "0%",
    todayStatus: "Not Marked"
  })


  // =========================
  // LOAD STUDENTS
  // =========================

  function loadStudents() {

    const savedStudents =
      JSON.parse(
        localStorage.getItem(
          "tantraStudents"
        )
      ) || []


    const savedAttendance =
      JSON.parse(
        localStorage.getItem(
          "tantraAttendance"
        )
      ) || []


    const savedProgress =
      JSON.parse(
        localStorage.getItem(
          "tantraStudentProgress"
        )
      ) || []


    const allStudents = [
      ...initialStudents,
      ...savedStudents
    ]


    const updatedStudents =
      allStudents.map((student) => {

        // Attendance

        const attendanceRecord =
          savedAttendance.find(
            (item) =>
              item.name === student.name
          )


        // Song progress

        const studentSongProgress =
          savedProgress.filter(
            (item) =>
              item.studentName ===
              student.name
          )


        let calculatedProgress =
          student.progress


        if (
          studentSongProgress.length > 0
        ) {

          const totalProgress =
            studentSongProgress.reduce(
              (sum, item) =>
                sum +
                (Number(
                  item.progress
                ) || 0),
              0
            )


          const averageProgress =
            Math.round(
              totalProgress /
              studentSongProgress.length
            )


          calculatedProgress =
            `${averageProgress}%`
        }


        return {

          ...student,

          attendance:
            attendanceRecord
              ? `${attendanceRecord.attendance}%`
              : student.attendance,

          todayStatus:
            attendanceRecord
              ? attendanceRecord.status
              : "Not Marked",

          progress:
            calculatedProgress

        }

      })


    setStudentList(
      updatedStudents
    )
  }


  // =========================
  // INITIAL LOAD + AUTO UPDATE
  // =========================

  useEffect(() => {

    loadStudents()


    window.addEventListener(
      "storage",
      loadStudents
    )

    window.addEventListener(
      "attendanceUpdated",
      loadStudents
    )

    window.addEventListener(
      "progressUpdated",
      loadStudents
    )

    window.addEventListener(
      "songsUpdated",
      loadStudents
    )

    return () => {

      window.removeEventListener(
        "storage",
        loadStudents
      )

      window.removeEventListener(
        "attendanceUpdated",
        loadStudents
      )

      window.removeEventListener(
        "progressUpdated",
        loadStudents
      )

      window.removeEventListener(
        "songsUpdated",
        loadStudents
      )

    }

  }, [])


  // =========================
  // SEARCH
  // =========================

  const filteredStudents =
    studentList.filter(
      (student) =>
        student.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        student.course
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )


  // =========================
  // CHANGE FEE
  // =========================

  function toggleFee(name) {

    const updatedStudents =
      studentList.map(
        (student) => {

          if (
            student.name === name
          ) {

            return {
              ...student,
              fee:
                student.fee === "Paid"
                  ? "Pending"
                  : "Paid"
            }

          }

          return student

        }
      )


    setStudentList(
      updatedStudents
    )


    const savedStudents =
      JSON.parse(
        localStorage.getItem(
          "tantraStudents"
        )
      ) || []


    const updatedSavedStudents =
      savedStudents.map(
        (student) => {

          if (
            student.name === name
          ) {

            const current =
              student.fee ===
              "Paid"

            return {
              ...student,
              fee:
                current
                  ? "Pending"
                  : "Paid"
            }

          }

          return student

        }
      )


    localStorage.setItem(
      "tantraStudents",
      JSON.stringify(
        updatedSavedStudents
      )
    )

  }


  // =========================
  // SUMMARY COUNTS
  // =========================

  const presentToday =
    studentList.filter(
      (student) =>
        student.todayStatus ===
        "Present"
    ).length


  const pendingFees =
    studentList.filter(
      (student) =>
        student.fee ===
        "Pending"
    ).length


  // =========================
  // ADD STUDENT
  // =========================

  function addStudent() {

    if (
      !newStudent.name.trim() ||
      !newStudent.course.trim()
    ) {

      alert(
        "Please enter student name and course."
      )

      return
    }


    const studentToAdd = {
      ...newStudent,
      name:
        newStudent.name.trim(),
      course:
        newStudent.course.trim()
    }


    const savedStudents =
      JSON.parse(
        localStorage.getItem(
          "tantraStudents"
        )
      ) || []


    const updatedSavedStudents = [
      ...savedStudents,
      studentToAdd
    ]


    localStorage.setItem(
      "tantraStudents",
      JSON.stringify(
        updatedSavedStudents
      )
    )


    setStudentList([
      ...studentList,
      studentToAdd
    ])


    setNewStudent({
      name: "",
      course: "",
      attendance: "0%",
      fee: "Pending",
      progress: "0%",
      todayStatus: "Not Marked"
    })


    setShowAddForm(false)
  }


  return (

    <div className="teacher-students-page">

      {/* HEADER */}

      <div className="teacher-students-header">

        <div>

          <p>
            STUDENT MANAGEMENT
          </p>

          <h1>
            Students 👨‍🎓
          </h1>

          <span>
            View your students and track
            their learning progress.
          </span>

        </div>


        <button
          className="add-student-btn"
          onClick={() =>
            setShowAddForm(true)
          }
        >
          + Add Student
        </button>

      </div>


      {/* SUMMARY */}

      <div className="student-summary">

        <div className="student-summary-card">

          <span>
            Total Students
          </span>

          <h2>
            {studentList.length}
          </h2>

          <p>
            Active students
          </p>

        </div>


        <div className="student-summary-card">

          <span>
            Present Today
          </span>

          <h2>
            {presentToday}
          </h2>

          <p>
            Students present
          </p>

        </div>


        <div className="student-summary-card">

          <span>
            Fees Pending
          </span>

          <h2>
            {pendingFees}
          </h2>

          <p>
            Students pending
          </p>

        </div>

      </div>


      {/* STUDENTS TABLE */}

      <div className="students-table-card">

        <div className="students-table-header">

          <h2>
            All Students
          </h2>


          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        <div className="students-table">

          <div className="student-table-head">

            <span>
              Student
            </span>

            <span>
              Course
            </span>

            <span>
              Attendance
            </span>

            <span>
              Fee
            </span>

            <span>
              Progress
            </span>

            <span>
              Action
            </span>

          </div>


          {filteredStudents.map(
            (student) => (

              <div
                className="student-table-row"
                key={student.name}
              >

                <div className="student-name">

                  <div className="student-avatar">
                    👤
                  </div>

                  <strong>
                    {student.name}
                  </strong>

                </div>


                <span>
                  {student.course}
                </span>


                <span>
                  {student.attendance}
                </span>


                <button
                  className={
                    student.fee === "Paid"
                      ? "student-fee-paid"
                      : "student-fee-pending"
                  }
                  onClick={() =>
                    toggleFee(
                      student.name
                    )
                  }
                >
                  {student.fee}
                </button>


                <span>
                  {student.progress}
                </span>


                <button
                  className="view-student-btn"
                  onClick={() =>
                    setSelectedStudent(
                      student
                    )
                  }
                >
                  View
                </button>

              </div>

            )
          )}


          {filteredStudents.length ===
            0 && (

            <div className="no-students">
              No students found 🔍
            </div>

          )}

        </div>

      </div>


      {/* ADD STUDENT MODAL */}

      {showAddForm && (

        <div className="student-modal-overlay">

          <div className="student-modal">

            <button
              className="student-modal-close"
              onClick={() =>
                setShowAddForm(false)
              }
            >
              ✕
            </button>


            <h2>
              Add New Student 👨‍🎓
            </h2>


            <input
              type="text"
              placeholder="Student name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  name:
                    e.target.value
                })
              }
            />


            <input
              type="text"
              placeholder="Course"
              value={newStudent.course}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  course:
                    e.target.value
                })
              }
            />


            <select
              value={newStudent.fee}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  fee:
                    e.target.value
                })
              }
            >

              <option value="Paid">
                Paid
              </option>

              <option value="Pending">
                Pending
              </option>

            </select>


            <button
              className="close-details-btn"
              onClick={addStudent}
            >
              Add Student
            </button>

          </div>

        </div>

      )}


      {/* VIEW STUDENT MODAL */}

      {selectedStudent && (

        <div className="student-modal-overlay">

          <div className="student-modal">

            <button
              className="student-modal-close"
              onClick={() =>
                setSelectedStudent(
                  null
                )
              }
            >
              ✕
            </button>


            <div className="student-modal-avatar">
              👤
            </div>


            <h2>
              {selectedStudent.name}
            </h2>


            <p className="student-modal-course">
              {selectedStudent.course}
            </p>


            <div className="student-modal-details">

              <div>

                <span>
                  📊 Attendance
                </span>

                <strong>
                  {selectedStudent.attendance}
                </strong>

              </div>


              <div>

                <span>
                  📅 Today's Status
                </span>

                <strong>
                  {selectedStudent.todayStatus}
                </strong>

              </div>


              <div>

                <span>
                  💰 Fee Status
                </span>

                <strong>
                  {selectedStudent.fee}
                </strong>

              </div>


              <div>

                <span>
                  📈 Learning Progress
                </span>

                <strong>
                  {selectedStudent.progress}
                </strong>

              </div>

            </div>


            <button
              className="close-details-btn"
              onClick={() =>
                setSelectedStudent(
                  null
                )
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  )
}


export default TeacherStudents

