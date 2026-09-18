import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function TeacherSchedule() {

  const [schedule, setSchedule] = useState(
    JSON.parse(
      localStorage.getItem("tantraSchedule") || "[]"
    )
  )

  const [showForm, setShowForm] = useState(false)

  const [newClass, setNewClass] = useState({
    date: "",
    time: "",
    title: "",
    course: "",
    room: ""
  })


  // =========================================
  // LOAD SCHEDULE
  // =========================================

  function loadSchedule() {

    const savedSchedule =
      JSON.parse(
        localStorage.getItem("tantraSchedule") || "[]"
      )

    setSchedule(savedSchedule)

  }


  // =========================================
  // LIVE UPDATE
  // =========================================

  useEffect(() => {

    loadSchedule()

    window.addEventListener(
      "storage",
      loadSchedule
    )

    window.addEventListener(
      "scheduleUpdated",
      loadSchedule
    )

    return () => {

      window.removeEventListener(
        "storage",
        loadSchedule
      )

      window.removeEventListener(
        "scheduleUpdated",
        loadSchedule
      )

    }

  }, [])


  // =========================================
  // ADD CLASS
  // =========================================

  function addClass() {

    if (
      !newClass.date ||
      !newClass.time ||
      !newClass.title.trim() ||
      !newClass.course.trim() ||
      !newClass.room.trim()
    ) {

      alert("Please fill all fields.")
      return

    }


    const dateObject =
      new Date(
        `${newClass.date}T00:00:00`
      )


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


    const newSchedule = {

      id: Date.now(),

      date: newClass.date,

      day:
        String(
          dateObject.getDate()
        ).padStart(2, "0"),

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
        newClass.room.trim()

    }


    const updatedSchedule = [
      ...schedule,
      newSchedule
    ]


    setSchedule(updatedSchedule)


    localStorage.setItem(
      "tantraSchedule",
      JSON.stringify(updatedSchedule)
    )


    window.dispatchEvent(
      new Event("scheduleUpdated")
    )


    // =========================================
    // STUDENT NOTIFICATION
    // =========================================

    const existingNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraNotifications"
        ) || "[]"
      )


    const newNotification = {

      id: Date.now() + 1,

      icon: "📅",

      title:
        "New class scheduled",

      message:
        `${newSchedule.title} - ${newSchedule.course} on ${newSchedule.day} ${newSchedule.month} at ${newSchedule.time}.`,

      type:
        "Class",

      time:
        "Just now",

      unread:
        true

    }


    localStorage.setItem(
      "tantraNotifications",
      JSON.stringify([
        newNotification,
        ...existingNotifications
      ])
    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
    )


    // =========================================
    // RESET
    // =========================================

    setNewClass({
      date: "",
      time: "",
      title: "",
      course: "",
      room: ""
    })

    setShowForm(false)


    alert(
      "Class scheduled successfully! 📅"
    )

  }


  // =========================================
  // DELETE CLASS
  // =========================================

  function deleteClass(id) {

    const selectedClass =
      schedule.find(
        (item) => item.id === id
      )


    const confirmed =
      window.confirm(
        `Delete "${selectedClass?.title || "this class"}"?`
      )


    if (!confirmed) {
      return
    }


    const updatedSchedule =
      schedule.filter(
        (item) => item.id !== id
      )


    setSchedule(updatedSchedule)


    localStorage.setItem(
      "tantraSchedule",
      JSON.stringify(updatedSchedule)
    )


    window.dispatchEvent(
      new Event("scheduleUpdated")
    )

  }


  // =========================================
  // TODAY
  // =========================================

  const today = new Date()

  today.setHours(
    0,
    0,
    0,
    0
  )


  // =========================================
  // UPCOMING CLASSES
  // =========================================

  const upcomingClasses =
    schedule.filter(
      (item) => {

        const classDate =
          new Date(
            `${item.date}T00:00:00`
          )

        return classDate >= today

      }
    )


  // =========================================
  // SORT SCHEDULE
  // =========================================

  const sortedSchedule =
    schedule
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

          return dateA - dateB

        }
      )


  return (

    <div className="teacher-schedule-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="teacher-schedule-header">

        <div>

          <p>
            CLASS MANAGEMENT
          </p>

          <h1>
            Teacher Schedule 📅
          </h1>

          <span>
            Manage your upcoming classes and sessions.
          </span>

        </div>


        <button
          type="button"
          className="add-schedule-btn"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Add Class
        </button>

      </div>


      {/* =================================
          BACK TO DASHBOARD
      ================================= */}

      <Link
        to="/teacher-dashboard"
        className="teacher-schedule-back"
      >
        Back to Dashboard
      </Link>


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="teacher-schedule-summary">

        <div className="teacher-schedule-summary-card">

          <span>
            Total Classes
          </span>

          <h2>
            {schedule.length}
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


      {/* =================================
          SCHEDULE LIST
      ================================= */}

      <div className="teacher-schedule-list">

        {schedule.length === 0 ? (

          <div className="no-teacher-schedule">

            <div>
              📅
            </div>

            <h2>
              No classes scheduled
            </h2>

            <p>
              Click "Add Class" to create a schedule.
            </p>

          </div>

        ) : (

          sortedSchedule.map(
            (item) => (

              <div
                className="teacher-schedule-card"
                key={item.id}
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

                </div>


                {/* DELETE */}

                <button
                  type="button"
                  className="delete-schedule-btn"
                  onClick={() =>
                    deleteClass(item.id)
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            )
          )

        )}

      </div>


      {/* =================================
          ADD CLASS MODAL
      ================================= */}

      {showForm && (

        <div
          className="schedule-modal-overlay"
          onClick={(e) => {

            if (
              e.target === e.currentTarget
            ) {

              setShowForm(false)

            }

          }}
        >

          <div className="schedule-modal">


            {/* CLOSE */}

            <button
              type="button"
              className="schedule-modal-close"
              onClick={() =>
                setShowForm(false)
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


            {/* CLASS NAME */}

            <input
              type="text"
              placeholder="Class name"
              value={newClass.title}
              onChange={(e) =>
                setNewClass({
                  ...newClass,
                  title: e.target.value
                })
              }
            />


            {/* COURSE */}

            <input
              type="text"
              placeholder="Course"
              value={newClass.course}
              onChange={(e) =>
                setNewClass({
                  ...newClass,
                  course: e.target.value
                })
              }
            />


            {/* DATE */}

            <input
              type="date"
              value={newClass.date}
              onChange={(e) =>
                setNewClass({
                  ...newClass,
                  date: e.target.value
                })
              }
            />


            {/* TIME */}

            <input
              type="time"
              value={newClass.time}
              onChange={(e) =>
                setNewClass({
                  ...newClass,
                  time: e.target.value
                })
              }
            />


            {/* ROOM */}

            <input
              type="text"
              placeholder="Room / Location"
              value={newClass.room}
              onChange={(e) =>
                setNewClass({
                  ...newClass,
                  room: e.target.value
                })
              }
            />


            {/* SCHEDULE */}

            <button
              type="button"
              className="publish-song-btn"
              onClick={addClass}
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