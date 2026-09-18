import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

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
        localStorage.getItem("tantraAttendance")
      ) || defaultAttendance
    )


  const [studentsData, setStudentsData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem("tantraStudents")
      ) || []
    )


  const [songsData, setSongsData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem("tantraSongs")
      ) || []
    )


  const [feesData, setFeesData] =
    useState(() =>
      JSON.parse(
        localStorage.getItem("tantraFees")
      ) || defaultFees
    )


  // ==============================
  // LOAD DASHBOARD DATA
  // ==============================

  useEffect(() => {

    function loadDashboardData() {

      const savedAttendance =
        JSON.parse(
          localStorage.getItem("tantraAttendance")
        )


      const savedStudents =
        JSON.parse(
          localStorage.getItem("tantraStudents")
        )


      const savedSongs =
        JSON.parse(
          localStorage.getItem("tantraSongs")
        )


      const savedFees =
        JSON.parse(
          localStorage.getItem("tantraFees")
        )


      setAttendanceData(
        savedAttendance || defaultAttendance
      )


      setStudentsData(
        savedStudents || []
      )


      setSongsData(
        savedSongs || []
      )


      setFeesData(
        savedFees || defaultFees
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
        student.status === "Pending"
    ).length


  const totalAttendance =
    attendanceData.reduce(
      (total, student) =>
        total +
        Number(
          student.attendance || 0
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

  const [task, setTask] = useState({
    title: "",
    course: "",
    dueDate: "",
    instructions: ""
  })


  // ==============================
  // SONG DATA
  // ==============================

  const [song, setSong] = useState({
    title: "",
    artist: "",
    course: "Vocal Training",
    difficulty: "Beginner",
    lyrics: "",
    instructions: "",
    audioLink: ""
  })


  const [published, setPublished] =
    useState(false)


  // ==============================
  // PUBLISH SONG
  // ==============================

  function publishSong() {

    if (!song.title.trim()) {
      alert("Please enter the song name")
      return
    }


    if (!song.artist.trim()) {
      alert("Please enter the artist name")
      return
    }


    const newSong = {
      id: Date.now(),
      title: song.title.trim(),
      artist: song.artist.trim(),
      course: song.course,
      difficulty: song.difficulty,
      lyrics: song.lyrics,
      instructions: song.instructions,
      audioLink: song.audioLink,
      status: "New",
      progress: 0
    }


    const existingSongs =
      JSON.parse(
        localStorage.getItem("tantraSongs")
      ) || []


    const updatedSongs = [
      ...existingSongs,
      newSong
    ]


    localStorage.setItem(
      "tantraSongs",
      JSON.stringify(updatedSongs)
    )


    setSongsData(updatedSongs)


    window.dispatchEvent(
      new Event("songsUpdated")
    )


    // ==============================
    // STUDENT NOTIFICATION
    // ==============================

    const existingNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    const newNotification = {
      id: Date.now() + 1,
      icon: "🎵",
      title: "New song assigned",
      message:
        `Your teacher added "${song.title}" by ${song.artist}.`,
      type: "Music",
      time: "Just now",
      unread: true
    }


    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify([
        newNotification,
        ...existingNotifications
      ])
    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
    )


    setPublished(true)


    setTimeout(() => {

      setShowSongForm(false)

      setPublished(false)

      setSong({
        title: "",
        artist: "",
        course: "Vocal Training",
        difficulty: "Beginner",
        lyrics: "",
        instructions: "",
        audioLink: ""
      })

    }, 1500)

  }


  // ==============================
  // CREATE TASK
  // ==============================

  function createTask() {

    if (!task.title.trim()) {
      alert("Please enter the task title")
      return
    }


    if (!task.course.trim()) {
      alert("Please enter the course")
      return
    }


    if (!task.dueDate) {
      alert("Please select a due date")
      return
    }


    const newTask = {
      id: Date.now(),
      title: task.title.trim(),
      course: task.course.trim(),
      dueDate: task.dueDate,
      instructions: task.instructions.trim(),
      status: "Pending"
    }


    const existingTasks =
      JSON.parse(
        localStorage.getItem("tantraTasks")
      ) || []


    const updatedTasks = [
      ...existingTasks,
      newTask
    ]


    localStorage.setItem(
      "tantraTasks",
      JSON.stringify(updatedTasks)
    )


    window.dispatchEvent(
      new Event("tasksUpdated")
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
      id: Date.now() + 1,
      icon: "✅",
      title: "New practice task",
      message:
        `Your teacher assigned "${task.title}".`,
      type: "Task",
      time: "Just now",
      unread: true
    }


    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify([
        taskNotification,
        ...studentNotifications
      ])
    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
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


    setShowTaskForm(false)

  }


  // ==============================
  // DASHBOARD
  // ==============================

  return (

    <div className="teacher-dashboard">

      {/* MAIN CONTENT */}

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


        {/* STATISTICS */}

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


          {/* AVERAGE ATTENDANCE */}

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


        {/* QUICK ACTIONS */}

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


            <button
              className="teacher-action-card"
              onClick={() =>
                setShowSongForm(true)
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


            <button
              className="teacher-action-card"
              onClick={() =>
                setShowTaskForm(true)
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


        {/* RECENT ACTIVITY */}

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
              e.target === e.currentTarget
            ) {
              setShowSongForm(false)
            }

          }}
        >

          <div className="song-modal">

            <button
              className="modal-close"
              onClick={() =>
                setShowSongForm(false)
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


            <input
              type="text"
              placeholder="Song title"
              value={song.title}
              onChange={(e) =>
                setSong({
                  ...song,
                  title: e.target.value
                })
              }
            />


            <input
              type="text"
              placeholder="Artist name"
              value={song.artist}
              onChange={(e) =>
                setSong({
                  ...song,
                  artist: e.target.value
                })
              }
            />


            <input
              type="text"
              placeholder="Course"
              value={song.course}
              onChange={(e) =>
                setSong({
                  ...song,
                  course: e.target.value
                })
              }
            />


            <select
              value={song.difficulty}
              onChange={(e) =>
                setSong({
                  ...song,
                  difficulty: e.target.value
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


            <textarea
              placeholder="Lyrics / authorized learning material"
              value={song.lyrics}
              onChange={(e) =>
                setSong({
                  ...song,
                  lyrics: e.target.value
                })
              }
            />


            <textarea
              placeholder="Teaching instructions"
              value={song.instructions}
              onChange={(e) =>
                setSong({
                  ...song,
                  instructions: e.target.value
                })
              }
            />


            <input
              type="url"
              placeholder="Audio link"
              value={song.audioLink}
              onChange={(e) =>
                setSong({
                  ...song,
                  audioLink: e.target.value
                })
              }
            />


            {published && (

              <p className="publish-success">
                🎉 Song published successfully!
              </p>

            )}


            <button
              className="publish-song-btn"
              onClick={publishSong}
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
              e.target === e.currentTarget
            ) {
              setShowTaskForm(false)
            }

          }}
        >

          <div className="song-modal">

            <button
              className="modal-close"
              onClick={() =>
                setShowTaskForm(false)
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


            <input
              type="text"
              placeholder="Task title"
              value={task.title}
              onChange={(e) =>
                setTask({
                  ...task,
                  title: e.target.value
                })
              }
            />


            <input
              type="text"
              placeholder="Course"
              value={task.course}
              onChange={(e) =>
                setTask({
                  ...task,
                  course: e.target.value
                })
              }
            />


            <input
              type="date"
              value={task.dueDate}
              onChange={(e) =>
                setTask({
                  ...task,
                  dueDate: e.target.value
                })
              }
            />


            <textarea
              placeholder="Task instructions"
              value={task.instructions}
              onChange={(e) =>
                setTask({
                  ...task,
                  instructions: e.target.value
                })
              }
            />


            <button
              className="publish-song-btn"
              onClick={createTask}
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