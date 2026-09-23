import { useEffect, useMemo, useState } from "react"
import {
  Link,
  useSearchParams
} from "react-router-dom"


// =====================================================
// API URLS
// =====================================================

const API_URL =
  "http://127.0.0.1:5000/api/schedule/"

const STUDENTS_API =
  "http://127.0.0.1:5000/api/admin/teacher-students"

const NOTIFICATIONS_API =
  "http://127.0.0.1:5000/api/notifications"


function TeacherSchedule() {

  const [searchParams, setSearchParams] =
    useSearchParams()

  const selectedStudentId =
    searchParams.get("studentId") || ""


  // =====================================================
  // STATE
  // =====================================================

  const [schedule, setSchedule] =
    useState([])

  const [students, setStudents] =
    useState([])

  const [showForm, setShowForm] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [newClass, setNewClass] =
    useState({
      date: "",
      time: "",
      title: "",
      course: "",
      room: "",
      studentId: "",
      studentName: ""
    })


  // =====================================================
  // JWT AUTH HEADERS
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
  // LOAD SCHEDULE
  // =====================================================

  async function loadSchedule() {

    try {

      setLoading(true)

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {

        console.error(
          "Teacher authentication token not found."
        )

        setSchedule([])

        return
      }


      const response =
        await fetch(
          API_URL,
          {
            method: "GET",
            headers: getAuthHeaders(),
            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        response.ok &&
        data.success
      ) {

        setSchedule(
          Array.isArray(
            data.schedule
          )
            ? data.schedule
            : []
        )

      } else {

        console.error(
          "Schedule loading failed:",
          data.message
        )

        setSchedule([])
      }

    } catch (error) {

      console.error(
        "Schedule API error:",
        error
      )

      setSchedule([])

    } finally {

      setLoading(false)
    }
  }


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  async function loadStudents() {

    try {

      const response =
        await fetch(
          STUDENTS_API,
          {
            method: "GET",
            headers: getAuthHeaders(),
            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.students
        )
      ) {

        setStudents(
          data.students
        )

      } else {

        console.error(
          "Student loading failed:",
          data.message
        )

        setStudents([])
      }

    } catch (error) {

      console.error(
        "Student loading error:",
        error
      )

      setStudents([])
    }
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadSchedule()
    loadStudents()


    function handleScheduleUpdated() {

      loadSchedule()
    }


    window.addEventListener(
      "scheduleUpdated",
      handleScheduleUpdated
    )


    return () => {

      window.removeEventListener(
        "scheduleUpdated",
        handleScheduleUpdated
      )
    }

  }, [])


  // =====================================================
  // SELECTED STUDENT FROM URL
  // =====================================================

  const selectedStudent =
    useMemo(() => {

      if (!selectedStudentId) {
        return null
      }


      return students.find(
        student =>
          String(
            student.id ||
            student._id ||
            student.userId
          ) ===
          String(
            selectedStudentId
          )
      ) || null

    }, [
      students,
      selectedStudentId
    ])


  // =====================================================
  // VIEW ALL STUDENTS
  // =====================================================

  function showAllStudents() {

    setSearchParams({})
  }


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  function openAddForm() {

    setNewClass({

      date: "",
      time: "",
      title: "",
      course: "",
      room: "",

      studentId:
        selectedStudentId || "",

      studentName:
        selectedStudent?.name ||
        selectedStudent?.studentName ||
        ""

    })

    setShowForm(true)
  }


  // =====================================================
  // CLOSE FORM
  // =====================================================

  function closeForm() {

    setShowForm(false)

    setNewClass({

      date: "",
      time: "",
      title: "",
      course: "",
      room: "",
      studentId: "",
      studentName: ""
    })
  }


  // =====================================================
  // VISIBLE SCHEDULE
  // =====================================================

  const visibleSchedule =
    useMemo(() => {

      if (!selectedStudentId) {
        return schedule
      }


      return schedule.filter(
        item => {

          if (
            !item.studentId
          ) {

            return true
          }


          return (
            String(
              item.studentId
            ) ===
            String(
              selectedStudentId
            )
          )
        }
      )

    }, [
      schedule,
      selectedStudentId
    ])


  // =====================================================
  // ADD CLASS
  // =====================================================

  async function addClass() {

    if (
      !newClass.date ||
      !newClass.time ||
      !newClass.title.trim() ||
      !newClass.course.trim() ||
      !newClass.room.trim()
    ) {

      alert(
        "Please fill all fields."
      )

      return
    }


    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    if (!token) {

      alert(
        "Your login session has expired. Please login again."
      )

      return
    }


    // ===================================================
    // DATE
    // ===================================================

    const dateObject =
      new Date(
        `${newClass.date}T00:00:00`
      )


    // ===================================================
    // TIME
    // ===================================================

    const timeObject =
      new Date(
        `1970-01-01T${newClass.time}`
      )


    const formattedTime =
      timeObject.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit"
        }
      )


    // ===================================================
    // STUDENT
    // ===================================================

    let studentId =
      newClass.studentId

    let studentName =
      newClass.studentName


    // If opened from a specific student's page,
    // always use that student.

    if (selectedStudentId) {

      studentId =
        String(
          selectedStudentId
        )

      studentName =
        selectedStudent?.name ||
        selectedStudent?.studentName ||
        ""
    }


    // ===================================================
    // SCHEDULE DATA
    // ===================================================

    const scheduleData = {

      date:
        newClass.date,

      day:
        String(
          dateObject.getDate()
        ).padStart(
          2,
          "0"
        ),

      month:
        dateObject
          .toLocaleString(
            "en-US",
            {
              month: "short"
            }
          )
          .toUpperCase(),

      time:
        formattedTime,

      title:
        newClass.title.trim(),

      course:
        newClass.course.trim(),

      room:
        newClass.room.trim(),

      studentId:
        studentId
          ? String(studentId)
          : "",

      studentName:
        studentName || ""

    }


    // ===================================================
    // CREATE SCHEDULE
    // ===================================================

    try {

      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify(
                scheduleData
              )
          }
        )


      const data =
        await response.json()


      if (
        !response.ok ||
        !data.success
      ) {

        console.error(
          "Schedule creation failed:",
          data
        )

        alert(
          data.message ||
          "Unable to schedule class."
        )

        return
      }


      // =================================================
      // RELOAD DATA
      // =================================================

      await loadSchedule()


      // =================================================
      // NOTIFICATION
      // =================================================

      try {

        const notification = {

          title:
            "New class scheduled",

          message:
            `${scheduleData.title} - ${scheduleData.course} on ${scheduleData.day} ${scheduleData.month} at ${scheduleData.time}.`,

          type:
            "Class"
        }


        // -----------------------------------------------
        // SPECIFIC STUDENT
        // -----------------------------------------------

        if (
          scheduleData.studentId
        ) {

          await fetch(
            NOTIFICATIONS_API,
            {
              method: "POST",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({

                  userId:
                    String(
                      scheduleData.studentId
                    ),

                  title:
                    notification.title,

                  message:
                    notification.message,

                  type:
                    notification.type
                })
            }
          )
        }


        // -----------------------------------------------
        // ALL STUDENTS
        // -----------------------------------------------

        else {

          const studentsResponse =
            await fetch(
              STUDENTS_API,
              {
                method: "GET",

                headers:
                  getAuthHeaders(),

                cache: "no-store"
              }
            )


          const studentsData =
            await studentsResponse.json()


          if (
            studentsResponse.ok &&
            studentsData.success &&
            Array.isArray(
              studentsData.students
            )
          ) {

            for (
              const student
              of studentsData.students
            ) {

              const studentId =
                student.id ||
                student._id ||
                student.userId


              if (!studentId) {
                continue
              }


              await fetch(
                NOTIFICATIONS_API,
                {
                  method: "POST",

                  headers:
                    getAuthHeaders(),

                  body:
                    JSON.stringify({

                      userId:
                        String(
                          studentId
                        ),

                      title:
                        notification.title,

                      message:
                        notification.message,

                      type:
                        notification.type
                    })
                }
              )
            }
          }
        }

      } catch (
        notificationError
      ) {

        console.error(
          "Notification error:",
          notificationError
        )
      }


      // =================================================
      // RESET
      // =================================================

      closeForm()


      window.dispatchEvent(
        new Event(
          "scheduleUpdated"
        )
      )


      alert(
        "Class scheduled successfully! 📅"
      )


    } catch (error) {

      console.error(
        "Schedule POST error:",
        error
      )

      alert(
        "Unable to connect to the server."
      )
    }
  }


  // =====================================================
  // DELETE CLASS
  // =====================================================

  async function deleteClass(id) {

    const selectedClass =
      schedule.find(
        item =>
          String(
            item.id ||
            item._id
          ) ===
          String(id)
      )


    const confirmed =
      window.confirm(
        `Delete "${selectedClass?.title || "this class"}"?`
      )


    if (!confirmed) {
      return
    }


    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    if (!token) {

      alert(
        "Your login session has expired. Please login again."
      )

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


      if (
        !response.ok ||
        !data.success
      ) {

        console.error(
          "Schedule delete failed:",
          data
        )

        alert(
          data.message ||
          "Unable to delete class."
        )

        return
      }


      setSchedule(
        currentSchedule =>
          currentSchedule.filter(
            item =>
              String(
                item.id ||
                item._id
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
        "Class deleted successfully! 🗑️"
      )


    } catch (error) {

      console.error(
        "Schedule DELETE error:",
        error
      )

      alert(
        "Unable to connect to the server."
      )
    }
  }


  // =====================================================
  // TODAY
  // =====================================================

  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0
  )


  // =====================================================
  // UPCOMING CLASSES
  // =====================================================

  const upcomingClasses =
    visibleSchedule.filter(
      item => {

        const classDate =
          new Date(
            `${item.date}T00:00:00`
          )


        return (
          classDate >=
          today
        )
      }
    )


  // =====================================================
  // SORT SCHEDULE
  // =====================================================

  const sortedSchedule =
    visibleSchedule
      .slice()
      .sort(
        (a, b) => {

          const dateA =
            new Date(
              `${a.date}T00:00:00`
            )


          const dateB =
            new Date(
              `${b.date}T00:00:00`
            )


          return (
            dateA - dateB
          )
        }
      )


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="teacher-schedule-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="teacher-schedule-header">

        <div>

          <p>
            CLASS MANAGEMENT
          </p>

          <h1>
            Teacher Schedule 📅
          </h1>

          <span>
            {selectedStudentId
              ? `Schedule for ${
                  selectedStudent?.name ||
                  "selected student"
                }`
              : "Manage your upcoming classes and sessions."
            }
          </span>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >

          {selectedStudentId && (

            <button
              type="button"
              className="secondary-button"
              onClick={
                showAllStudents
              }
            >
              👥 View All Students
            </button>

          )}


          <button
            type="button"
            className="add-schedule-btn"
            onClick={
              openAddForm
            }
          >
            + Add Class
          </button>

        </div>

      </div>


      {/* =================================================
          BACK TO DASHBOARD
      ================================================= */}

      {!selectedStudentId && (

        <Link
          to="/teacher-dashboard"
          className="teacher-schedule-back"
        >
          Back to Dashboard
        </Link>

      )}


      {/* =================================================
          SELECTED STUDENT BANNER
      ================================================= */}

      {selectedStudentId && (

        <div
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
            gap: "15px",
            flexWrap: "wrap"
          }}
        >

          <div>

            <strong
              style={{
                color: "#6d28d9",
                fontSize: "16px"
              }}
            >
              👤 Selected Student
            </strong>

            <span
              style={{
                marginLeft: "8px",
                color: "#4c4560",
                fontWeight: "700"
              }}
            >
              {selectedStudent?.name ||
                selectedStudent?.studentName ||
                "Student"}
            </span>

          </div>


          <strong
            style={{
              color: "#7c3aed"
            }}
          >
            📅 {visibleSchedule.length} class
            {visibleSchedule.length !== 1
              ? "es"
              : ""}
          </strong>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="teacher-schedule-summary">

        <div className="teacher-schedule-summary-card">

          <span>
            Total Classes
          </span>

          <h2>
            {visibleSchedule.length}
          </h2>

          <p>
            Scheduled sessions
          </p>

        </div>


        <div className="teacher-schedule-summary-card">

          <span>
            Upcoming
          </span>

          <h2>
            {upcomingClasses.length}
          </h2>

          <p>
            Upcoming classes
          </p>

        </div>

      </div>


      {/* =================================================
          SCHEDULE LIST
      ================================================= */}

      <div className="teacher-schedule-list">

        {loading ? (

          <div className="no-teacher-schedule">

            <div>
              ⏳
            </div>

            <h2>
              Loading schedule...
            </h2>

            <p>
              Please wait while classes are loaded.
            </p>

          </div>

        ) : sortedSchedule.length === 0 ? (

          <div className="no-teacher-schedule">

            <div>
              📅
            </div>

            <h2>
              No classes scheduled
            </h2>

            <p>
              {selectedStudentId
                ? `No classes are currently available for ${
                    selectedStudent?.name ||
                    "this student"
                  }.`
                : 'Click "Add Class" to create a schedule.'
              }
            </p>


            <button
              type="button"
              className="add-schedule-btn"
              onClick={
                openAddForm
              }
            >
              + Add Class
            </button>

          </div>

        ) : (

          sortedSchedule.map(
            item => (

              <div
                className="teacher-schedule-card"
                key={
                  item.id ||
                  item._id
                }
              >

                {/* DATE */}

                <div className="teacher-schedule-date">

                  <strong>
                    {item.day}
                  </strong>

                  <span>
                    {item.month}
                  </span>

                </div>


                {/* CLASS INFORMATION */}

                <div className="teacher-schedule-info">

                  <span>
                    {item.course}
                  </span>

                  <h2>
                    {item.title}
                  </h2>

                  <p>
                    🕐 {item.time}
                    &nbsp;&nbsp;
                    📍 {item.room}
                  </p>


                  {item.studentId && (

                    <small
                      style={{
                        color: "#7c3aed",
                        fontWeight: "700"
                      }}
                    >
                      👤{" "}
                      {item.studentName ||
                        "Student-specific class"}
                    </small>

                  )}

                </div>


                {/* DELETE */}

                <button
                  type="button"
                  className="delete-schedule-btn"
                  onClick={() =>
                    deleteClass(
                      item.id ||
                      item._id
                    )
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            )
          )

        )}

      </div>


      {/* =================================================
          ADD CLASS MODAL
      ================================================= */}

      {showForm && (

        <div
          className="schedule-modal-overlay"
          onClick={
            event => {

              if (
                event.target ===
                event.currentTarget
              ) {

                closeForm()
              }
            }
          }
        >

          <div className="schedule-modal">


            {/* CLOSE */}

            <button
              type="button"
              className="schedule-modal-close"
              onClick={
                closeForm
              }
            >
              ✕
            </button>


            <p>
              NEW CLASS
            </p>

            <h2>
              Schedule a Class 📅
            </h2>


            {/* =================================================
                SELECTED STUDENT
            ================================================= */}

            {selectedStudentId &&
              selectedStudent && (

                <div
                  style={{
                    marginBottom: "15px",
                    padding: "12px",
                    borderRadius: "10px",
                    background:
                      "#f3e8ff",
                    color:
                      "#6d28d9",
                    fontWeight: "700"
                  }}
                >
                  👤 For:{" "}
                  {selectedStudent.name ||
                    selectedStudent.studentName}
                </div>

              )}


            {/* =================================================
                STUDENT DROPDOWN
            ================================================= */}

            {!selectedStudentId && (

              <div
                className="schedule-student-select-wrapper"
                style={{
                  marginBottom: "16px"
                }}
              >

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#4c4560"
                  }}
                >
                  Select Student
                </label>


                <select
                  value={
                    newClass.studentId
                  }
                  onChange={
                    event => {

                      const studentId =
                        event.target.value


                      if (!studentId) {

                        setNewClass({
                          ...newClass,
                          studentId: "",
                          studentName: ""
                        })

                        return
                      }


                      const student =
                        students.find(
                          item =>
                            String(
                              item.id ||
                              item._id ||
                              item.userId
                            ) ===
                            String(
                              studentId
                            )
                        )


                      setNewClass({

                        ...newClass,

                        studentId:
                          studentId,

                        studentName:
                          student?.name ||
                          student?.studentName ||
                          ""

                      })
                    }
                  }

                  style={{
                    width: "100%",
                    padding: "15px 16px",
                    border:
                      "1px solid #ddd6fe",
                    borderRadius: "14px",
                    background: "#faf9ff",
                    color: "#29243a",
                    fontSize: "16px",
                    outline: "none"
                  }}
                >

                  <option value="">
                    All Students / Common Class
                  </option>


                  {students.map(
                    student => {

                      const studentId =
                        student.id ||
                        student._id ||
                        student.userId


                      const studentName =
                        student.name ||
                        student.studentName ||
                        "Student"


                      return (

                        <option
                          key={
                            studentId
                          }
                          value={
                            studentId
                          }
                        >
                          {studentName}
                        </option>

                      )
                    }
                  )}

                </select>

              </div>

            )}


            {/* =================================================
                CLASS NAME
            ================================================= */}

            <input
              type="text"
              placeholder="Class name"
              value={
                newClass.title
              }
              onChange={
                event =>
                  setNewClass({
                    ...newClass,
                    title:
                      event.target.value
                  })
              }
            />


            {/* =================================================
                COURSE
            ================================================= */}

            <input
              type="text"
              placeholder="Course"
              value={
                newClass.course
              }
              onChange={
                event =>
                  setNewClass({
                    ...newClass,
                    course:
                      event.target.value
                  })
              }
            />


            {/* =================================================
                DATE
            ================================================= */}

            <input
              type="date"
              value={
                newClass.date
              }
              onChange={
                event =>
                  setNewClass({
                    ...newClass,
                    date:
                      event.target.value
                  })
              }
            />


            {/* =================================================
                TIME
            ================================================= */}

            <input
              type="time"
              value={
                newClass.time
              }
              onChange={
                event =>
                  setNewClass({
                    ...newClass,
                    time:
                      event.target.value
                  })
              }
            />


            {/* =================================================
                ROOM
            ================================================= */}

            <input
              type="text"
              placeholder="Room / Location"
              value={
                newClass.room
              }
              onChange={
                event =>
                  setNewClass({
                    ...newClass,
                    room:
                      event.target.value
                  })
              }
            />


            {/* =================================================
                SCHEDULE
            ================================================= */}

            <button
              type="button"
              className="publish-song-btn"
              onClick={
                addClass
              }
            >
              Schedule Class 📅
            </button>

          </div>

        </div>

      )}

    </div>
  )
}


export default TeacherSchedule