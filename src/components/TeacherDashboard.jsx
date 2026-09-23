import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const SONGS_API =
  "http://127.0.0.1:5000/api/admin/songs"


// ============================================
// AUTH HEADERS
// ============================================

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


function TeacherDashboard() {

  // ==============================
  // DEFAULT ATTENDANCE DATA
  // ==============================

  const defaultAttendance = [
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
  // DEFAULT FEES DATA
  // ==============================

  const defaultFees = [
    {
      id: 1,
      name: "Arun Kumar",
      status: "Paid"
    },
    {
      id: 2,
      name: "Priya Sharma",
      status: "Paid"
    },
    {
      id: 3,
      name: "Rahul Raj",
      status: "Pending"
    },
    {
      id: 4,
      name: "Ananya S",
      status: "Paid"
    },
    {
      id: 5,
      name: "Karthik M",
      status: "Pending"
    },
    {
      id: 6,
      name: "Meena Devi",
      status: "Paid"
    }
  ]


  // ==============================
  // LIVE DASHBOARD DATA
  // ==============================

  const [attendanceData, setAttendanceData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem(
          "tantraAttendance"
        )
      ) || defaultAttendance
    )


  const [studentsData, setStudentsData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem(
          "tantraStudents"
        )
      ) || []
    )


  const [songsData, setSongsData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem(
          "tantraSongs"
        )
      ) || []
    )


  const [feesData, setFeesData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem(
          "tantraFees"
        )
      ) || defaultFees
    )


  // ==============================
  // LOAD DASHBOARD DATA
  // ==============================

  useEffect(() => {

    function loadDashboardData() {

      const savedAttendance =
        JSON.parse(
          localStorage.getItem(
            "tantraAttendance"
          )
        )


      const savedStudents =
        JSON.parse(
          localStorage.getItem(
            "tantraStudents"
          )
        )


      const savedSongs =
        JSON.parse(
          localStorage.getItem(
            "tantraSongs"
          )
        )


      const savedFees =
        JSON.parse(
          localStorage.getItem(
            "tantraFees"
          )
        )


      setAttendanceData(
        savedAttendance ||
        defaultAttendance
      )


      setStudentsData(
        savedStudents ||
        []
      )


      setSongsData(
        savedSongs ||
        []
      )


      setFeesData(
        savedFees ||
        defaultFees
      )

    }


    window.addEventListener(
      "storage",
      loadDashboardData
    )


    window.addEventListener(
      "attendanceUpdated",
      loadDashboardData
    )


    window.addEventListener(
      "studentsUpdated",
      loadDashboardData
    )


    window.addEventListener(
      "songsUpdated",
      loadDashboardData
    )


    window.addEventListener(
      "feesUpdated",
      loadDashboardData
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadDashboardData
      )


      window.removeEventListener(
        "attendanceUpdated",
        loadDashboardData
      )


      window.removeEventListener(
        "studentsUpdated",
        loadDashboardData
      )


      window.removeEventListener(
        "songsUpdated",
        loadDashboardData
      )


      window.removeEventListener(
        "feesUpdated",
        loadDashboardData
      )

    }

  }, [])


  // ==============================
  // DASHBOARD STATISTICS
  // ==============================

  const totalStudents =
    studentsData.length > 0
      ? studentsData.length
      : attendanceData.length


  const activeSongs =
    songsData.length


  const pendingFees =
    feesData.filter(
      (student) =>
        student.status ===
        "Pending"
    ).length


  const totalAttendance =
    attendanceData.reduce(
      (
        total,
        student
      ) =>
        total +
        Number(
          student.attendance ||
          0
        ),
      0
    )


  const averageAttendance =
    attendanceData.length > 0
      ? Math.round(
          totalAttendance /
          attendanceData.length
        )
      : 0


  // ==============================
  // POPUP STATES
  // ==============================

  const [showSongForm, setShowSongForm] =
    useState(false)


  const [showTaskForm, setShowTaskForm] =
    useState(false)


  // ==============================
  // TASK DATA
  // ==============================

  const [task, setTask] =
    useState({
      title: "",
      course: "",
      dueDate: "",
      instructions: ""
    })


  // ==============================
  // SONG DATA
  // ==============================

  const [song, setSong] =
    useState({
      title: "",
      artist: "",
      course:
        "Vocal Training",
      difficulty:
        "Beginner",
      lyrics: "",
      instructions: "",
      audioLink: ""
    })


  const [published, setPublished] =
    useState(false)


  // ==============================
  // PUBLISH SONG
  // ==============================

  async function publishSong() {

    if (!song.title.trim()) {

      alert(
        "Please enter the song name"
      )

      return
    }


    if (!song.artist.trim()) {

      alert(
        "Please enter the artist name"
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


    try {

      // ==================================
      // SAVE SONG TO MONGODB
      // ==================================

      const response =
        await fetch(
          SONGS_API,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                title:
                  song.title.trim(),

                artist:
                  song.artist.trim(),

                course:
                  song.course.trim(),

                lyrics:
                  song.lyrics.trim(),

                instructions:
                  song.instructions.trim(),

                audioLink:
                  song.audioLink.trim(),

                assignedStudentId:
                  ""

              })
          }
        )


      const data =
        await response.json()


      if (
        !response.ok ||
        data.success === false
      ) {

        throw new Error(
          data.message ||
          "Unable to publish song."
        )

      }


      // ==================================
      // LOAD SONGS FROM MONGODB
      // ==================================

      const songsResponse =
        await fetch(
          SONGS_API,
          {
            method: "GET",

            headers:
              getAuthHeaders(),

            cache:
              "no-store"
          }
        )


      const songsData =
        await songsResponse.json()


      if (
        songsResponse.ok &&
        songsData.success &&
        Array.isArray(
          songsData.songs
        )
      ) {

        setSongsData(
          songsData.songs
        )


        // Keep old dashboard
        // localStorage synchronized

        localStorage.setItem(
          "tantraSongs",
          JSON.stringify(
            songsData.songs
          )
        )

      }


      // ==================================
      // SAME TAB UPDATE
      // ==================================

      window.dispatchEvent(
        new Event(
          "songsUpdated"
        )
      )


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      const existingNotifications =
        JSON.parse(
          localStorage.getItem(
            "tantraTeacherNotifications"
          )
        ) || []


      const newNotification = {

        id:
          Date.now() + 1,

        icon:
          "🎵",

        title:
          "New song assigned",

        message:
          `Your teacher added "${song.title}" by ${song.artist}.`,

        type:
          "Music",

        time:
          "Just now",

        unread:
          true

      }


      localStorage.setItem(
        "tantraTeacherNotifications",

        JSON.stringify([
          newNotification,
          ...existingNotifications
        ])
      )


      window.dispatchEvent(
        new Event(
          "notificationsUpdated"
        )
      )


      // ==================================
      // SUCCESS MESSAGE
      // ==================================

      setPublished(true)


      setTimeout(() => {

        setShowSongForm(
          false
        )

        setPublished(
          false
        )

        setSong({

          title: "",

          artist: "",

          course:
            "Vocal Training",

          difficulty:
            "Beginner",

          lyrics: "",

          instructions: "",

          audioLink: ""

        })

      }, 1500)


    } catch (error) {

      console.error(
        "Teacher song publish error:",
        error
      )


      alert(
        error.message ||
        "Unable to publish song. Please try again."
      )

    }

  }


  // ==============================
  // CREATE TASK
  // ==============================

  function createTask() {

    if (!task.title.trim()) {

      alert(
        "Please enter the task title"
      )

      return
    }


    if (!task.course.trim()) {

      alert(
        "Please enter the course"
      )

      return
    }


    if (!task.dueDate) {

      alert(
        "Please select a due date"
      )

      return
    }


    const newTask = {

      id:
        Date.now(),

      title:
        task.title.trim(),

      course:
        task.course.trim(),

      dueDate:
        task.dueDate,

      instructions:
        task.instructions.trim(),

      status:
        "Pending"

    }


    const existingTasks =
      JSON.parse(
        localStorage.getItem(
          "tantraTasks"
        )
      ) || []


    const updatedTasks = [

      ...existingTasks,

      newTask

    ]


    localStorage.setItem(
      "tantraTasks",
      JSON.stringify(
        updatedTasks
      )
    )


    window.dispatchEvent(
      new Event(
        "tasksUpdated"
      )
    )


    // ==============================
    // STUDENT TASK NOTIFICATION
    // ==============================

    const studentNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    const taskNotification = {

      id:
        Date.now() + 1,

      icon:
        "✅",

      title:
        "New practice task",

      message:
        `Your teacher assigned "${task.title}".`,

      type:
        "Task",

      time:
        "Just now",

      unread:
        true

    }


    localStorage.setItem(
      "tantraTeacherNotifications",

      JSON.stringify([
        taskNotification,
        ...studentNotifications
      ])
    )


    window.dispatchEvent(
      new Event(
        "notificationsUpdated"
      )
    )


    alert(
      "Task created successfully! ✅"
    )


    setTask({

      title: "",

      course: "",

      dueDate: "",

      instructions: ""

    })


    setShowTaskForm(
      false
    )

  }


  // ==============================
  // DASHBOARD
  // ==============================

  return (

    <div className="teacher-dashboard">

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="teacher-main">

        {/* HEADER */}

        <div className="teacher-header">

          <div>

            <p>
              TEACHER PORTAL
            </p>


            <h1>
              Welcome back, Teacher 👋
            </h1>


            <span>
              Manage your students and academy activities.
            </span>

          </div>


          <div className="teacher-profile">
            👨‍🏫
          </div>

        </div>


        {/* ==========================================
            STATISTICS
        ========================================== */}

        <div className="teacher-stats">

          {/* TOTAL STUDENTS */}

          <div className="teacher-stat-card">

            <span>
              👨‍🎓
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


          {/* ATTENDANCE */}

          <div className="teacher-stat-card">

            <span>
              📊
            </span>

            <div>

              <p>
                Average Attendance
              </p>

              <h2>
                {averageAttendance}%
              </h2>

            </div>

          </div>


          {/* ACTIVE SONGS */}

          <div className="teacher-stat-card">

            <span>
              🎵
            </span>

            <div>

              <p>
                Active Songs
              </p>

              <h2>
                {activeSongs}
              </h2>

            </div>

          </div>


          {/* PENDING FEES */}

          <div className="teacher-stat-card">

            <span>
              💳
            </span>

            <div>

              <p>
                Pending Fees
              </p>

              <h2>
                {pendingFees}
              </h2>

            </div>

          </div>

        </div>


        {/* ==========================================
            QUICK ACTIONS
        ========================================== */}

        <div className="teacher-section">

          <div className="teacher-section-heading">

            <div>

              <p>
                QUICK ACTIONS
              </p>

              <h2>
                Manage Academy
              </h2>

            </div>

          </div>


          <div className="teacher-actions-grid">

            {/* STUDENTS */}

            <Link
              to="/teacher-students"
              className="teacher-action-card"
            >

              <div>
                👨‍🎓
              </div>

              <h3>
                Students
              </h3>

              <p>
                View and manage students
              </p>

            </Link>


            {/* ATTENDANCE */}

            <Link
              to="/teacher-attendance"
              className="teacher-action-card"
            >

              <div>
                📊
              </div>

              <h3>
                Attendance
              </h3>

              <p>
                Mark student attendance
              </p>

            </Link>


            {/* TEACH SONG */}

            <button
              className="teacher-action-card"
              onClick={() =>
                setShowSongForm(
                  true
                )
              }
            >

              <div>
                🎵
              </div>

              <h3>
                Teach a Song
              </h3>

              <p>
                Publish a new song lesson
              </p>

            </button>


            {/* CREATE TASK */}

            <button
              className="teacher-action-card"
              onClick={() =>
                setShowTaskForm(
                  true
                )
              }
            >

              <div>
                ✅
              </div>

              <h3>
                Create Task
              </h3>

              <p>
                Give students a practice task
              </p>

            </button>

          </div>

        </div>


        {/* ==========================================
            RECENT ACTIVITY
        ========================================== */}

        <div className="teacher-section">

          <div className="teacher-section-heading">

            <div>

              <p>
                RECENT ACTIVITY
              </p>

              <h2>
                Today's Overview
              </h2>

            </div>

          </div>


          <div className="teacher-activity-card">

            <div className="activity-item">

              <span>
                🎵
              </span>

              <div>

                <strong>
                  New song lessons
                </strong>

                <p>
                  Continue adding songs for your students.
                </p>

              </div>

            </div>


            <div className="activity-item">

              <span>
                📊
              </span>

              <div>

                <strong>
                  Attendance
                </strong>

                <p>
                  Check today's student attendance.
                </p>

              </div>

            </div>


            <div className="activity-item">

              <span>
                ✅
              </span>

              <div>

                <strong>
                  Practice tasks
                </strong>

                <p>
                  Create tasks for students to practice.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* ==================================================
          TEACH SONG POPUP
      ================================================== */}

      {showSongForm && (

        <div
          className="song-modal-overlay"

          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              setShowSongForm(
                false
              )

            }

          }}
        >

          <div className="song-modal">

            <button
              className="modal-close"

              onClick={() =>
                setShowSongForm(
                  false
                )
              }
            >
              ✕
            </button>


            <p>
              NEW SONG
            </p>


            <h2>
              Teach a Song 🎵
            </h2>


            {/* SONG TITLE */}

            <input
              type="text"

              placeholder="Song title"

              value={
                song.title
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  title:
                    e.target.value

                })
              }
            />


            {/* ARTIST */}

            <input
              type="text"

              placeholder="Artist name"

              value={
                song.artist
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  artist:
                    e.target.value

                })
              }
            />


            {/* COURSE */}

            <input
              type="text"

              placeholder="Course"

              value={
                song.course
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  course:
                    e.target.value

                })
              }
            />


            {/* DIFFICULTY */}

            <select
              value={
                song.difficulty
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  difficulty:
                    e.target.value

                })
              }
            >

              <option value="">
                Select difficulty
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>

            </select>


            {/* LYRICS */}

            <textarea
              placeholder="Lyrics / authorized learning material"

              value={
                song.lyrics
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  lyrics:
                    e.target.value

                })
              }
            />


            {/* INSTRUCTIONS */}

            <textarea
              placeholder="Teaching instructions"

              value={
                song.instructions
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  instructions:
                    e.target.value

                })
              }
            />


            {/* AUDIO */}

            <input
              type="url"

              placeholder="Audio link"

              value={
                song.audioLink
              }

              onChange={(e) =>
                setSong({

                  ...song,

                  audioLink:
                    e.target.value

                })
              }
            />


            {/* SUCCESS */}

            {published && (

              <p className="publish-success">

                🎉 Song published successfully!

              </p>

            )}


            {/* PUBLISH BUTTON */}

            <button
              className="publish-song-btn"

              onClick={
                publishSong
              }
            >

              Publish Song 🎵

            </button>

          </div>

        </div>

      )}


      {/* ==================================================
          CREATE TASK POPUP
      ================================================== */}

      {showTaskForm && (

        <div
          className="song-modal-overlay"

          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              setShowTaskForm(
                false
              )

            }

          }}
        >

          <div className="song-modal">

            <button
              className="modal-close"

              onClick={() =>
                setShowTaskForm(
                  false
                )
              }
            >
              ✕
            </button>


            <p>
              NEW TASK
            </p>


            <h2>
              Create Practice Task ✅
            </h2>


            {/* TASK TITLE */}

            <input
              type="text"

              placeholder="Task title"

              value={
                task.title
              }

              onChange={(e) =>
                setTask({

                  ...task,

                  title:
                    e.target.value

                })
              }
            />


            {/* COURSE */}

            <input
              type="text"

              placeholder="Course"

              value={
                task.course
              }

              onChange={(e) =>
                setTask({

                  ...task,

                  course:
                    e.target.value

                })
              }
            />


            {/* DUE DATE */}

            <input
              type="date"

              value={
                task.dueDate
              }

              onChange={(e) =>
                setTask({

                  ...task,

                  dueDate:
                    e.target.value

                })
              }
            />


            {/* INSTRUCTIONS */}

            <textarea
              placeholder="Task instructions"

              value={
                task.instructions
              }

              onChange={(e) =>
                setTask({

                  ...task,

                  instructions:
                    e.target.value

                })
              }
            />


            {/* CREATE */}

            <button
              className="publish-song-btn"

              onClick={
                createTask
              }
            >

              Create Task ✅

            </button>

          </div>

        </div>

      )}

    </div>

  )

}


export default TeacherDashboard