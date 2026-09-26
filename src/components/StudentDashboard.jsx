import { useEffect, useState } from "react"
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom"


const BACKEND_URL =
  "https://tantra-academy-1.onrender.com"


function StudentDashboard() {

  const navigate = useNavigate()
  const location = useLocation()


  // =====================================================
  // STATE
  // =====================================================

  const [student, setStudent] =
    useState({})

  const [songs, setSongs] =
    useState([])

  const [tasks, setTasks] =
    useState([])

  const [attendance, setAttendance] =
    useState([])

  const [fees, setFees] =
    useState([])

  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)


  // =====================================================
  // GET CURRENT STUDENT
  // =====================================================

  function getCurrentStudent() {

    try {

      const savedUser =
        sessionStorage.getItem(
          "tantraCurrentUser"
        )

      if (savedUser) {

        return JSON.parse(
          savedUser
        )
      }


      const loggedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (loggedUser) {

        return JSON.parse(
          loggedUser
        )
      }

    } catch (error) {

      console.error(
        "Student data error:",
        error
      )
    }

    return {}
  }


  // =====================================================
  // AUTH HEADERS
  // =====================================================

  function getAuthHeaders() {

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
  // LOAD STUDENT
  // =====================================================

  function loadStudent() {

    const currentStudent =
      getCurrentStudent()

    setStudent(
      currentStudent || {}
    )
  }


  // =====================================================
  // GET STUDENT ID
  // =====================================================

  function getStudentId() {

    const currentStudent =
      getCurrentStudent()

    return (
      currentStudent.id ||
      currentStudent._id ||
      currentStudent.userId ||
      ""
    )
  }


  // =====================================================
  // LOAD SONGS
  // =====================================================

  async function loadSongs() {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/admin/songs`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.songs
        )
      ) {

        const studentId =
          String(
            getStudentId()
          )


        const studentSongs =
          data.songs.filter(
            song => {

              const assignedId =
                song.assignedStudentId


              if (
                assignedId
              ) {

                return (
                  String(
                    assignedId
                  ) ===
                  studentId
                )
              }


              return true
            }
          )


        setSongs(
          studentSongs
        )

      } else {

        setSongs([])
      }

    } catch (error) {

      console.error(
        "Songs loading error:",
        error
      )

      setSongs([])
    }
  }


  // =====================================================
  // LOAD TASKS
  // =====================================================

  async function loadTasks() {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/admin/tasks`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.tasks
        )
      ) {

        const studentId =
          String(
            getStudentId()
          )


        const studentTasks =
          data.tasks.filter(
            task => {

              const assignedId =
                task.assignedStudentId


              if (
                assignedId
              ) {

                return (
                  String(
                    assignedId
                  ) ===
                  studentId
                )
              }


              return true
            }
          )


        setTasks(
          studentTasks
        )

      } else {

        setTasks([])
      }

    } catch (error) {

      console.error(
        "Tasks loading error:",
        error
      )

      setTasks([])
    }
  }


  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  async function loadAttendance() {

    try {

      const studentId =
        getStudentId()


      if (!studentId) {

        setAttendance([])

        return
      }


      const response =
        await fetch(
          `${BACKEND_URL}/api/attendance/?studentId=${encodeURIComponent(
            studentId
          )}`,
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
        "Student attendance:",
        response.status,
        data
      )


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.attendance
        )
      ) {

        setAttendance(
          data.attendance
        )

      } else {

        setAttendance([])
      }

    } catch (error) {

      console.error(
        "Attendance loading error:",
        error
      )

      setAttendance([])
    }
  }


  // =====================================================
  // LOAD FEES
  // =====================================================

  async function loadFees() {

    try {

      const studentId =
        getStudentId()


      if (!studentId) {

        setFees([])

        return
      }


      const response =
        await fetch(
          `${BACKEND_URL}/api/fees/?studentId=${encodeURIComponent(
            studentId
          )}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.fees
        )
      ) {

        setFees(
          data.fees
        )

      } else {

        setFees([])
      }

    } catch (error) {

      console.error(
        "Fees loading error:",
        error
      )

      setFees([])
    }
  }


  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  async function loadNotifications() {

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/notifications/`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.notifications
        )
      ) {

        setNotifications(
          data.notifications
        )

      } else {

        setNotifications([])
      }

    } catch (error) {

      console.error(
        "Notifications loading error:",
        error
      )

      setNotifications([])
    }
  }


  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  async function loadDashboardData() {

    setLoading(true)

    loadStudent()

    await Promise.all([
      loadSongs(),
      loadTasks(),
      loadAttendance(),
      loadFees(),
      loadNotifications()
    ])

    setLoading(false)
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadDashboardData()


    function refreshDashboard() {

      loadStudent()

      loadSongs()
      loadTasks()
      loadAttendance()
      loadFees()
      loadNotifications()
    }


    window.addEventListener(
      "songsUpdated",
      refreshDashboard
    )

    window.addEventListener(
      "tasksUpdated",
      refreshDashboard
    )

    window.addEventListener(
      "attendanceUpdated",
      refreshDashboard
    )

    window.addEventListener(
      "feesUpdated",
      refreshDashboard
    )

    window.addEventListener(
      "notificationsUpdated",
      refreshDashboard
    )


    return () => {

      window.removeEventListener(
        "songsUpdated",
        refreshDashboard
      )

      window.removeEventListener(
        "tasksUpdated",
        refreshDashboard
      )

      window.removeEventListener(
        "attendanceUpdated",
        refreshDashboard
      )

      window.removeEventListener(
        "feesUpdated",
        refreshDashboard
      )

      window.removeEventListener(
        "notificationsUpdated",
        refreshDashboard
      )
    }

  }, [])


  // =====================================================
  // ATTENDANCE CALCULATION
  // =====================================================

  const totalClasses =
    attendance.length


  const presentClasses =
    attendance.filter(
      record =>
        String(
          record.status || ""
        ).toLowerCase() ===
        "present"
    ).length


  const attendancePercentage =
    totalClasses > 0
      ? Math.round(
          (
            presentClasses /
            totalClasses
          ) * 100
        )
      : 0


  // =====================================================
  // TASK COUNT
  // =====================================================

  const pendingTasks =
    tasks.filter(
      task =>
        String(
          task.status || ""
        ).toLowerCase() !==
        "completed"
    ).length


  // =====================================================
  // FEE STATUS
  // =====================================================

  const latestFee =
    fees.length > 0
      ? fees[0]
      : null


  const feeStatus =
    latestFee
      ? String(
          latestFee.status ||
          latestFee.paymentStatus ||
          "Pending"
        ).toLowerCase() ===
        "paid"
        ? "Paid"
        : "Pending"
      : "Pending"


  // =====================================================
  // NOTIFICATION COUNT
  // =====================================================

  const unreadNotifications =
    notifications.filter(
      notification =>
        !notification.read
    ).length


  // =====================================================
  // STUDENT NAME
  // =====================================================

  const studentName =
    student.name ||
    student.studentName ||
    "Student"


  const studentCourse =
    student.course ||
    student.program ||
    "Music Student"


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
  // ACTIVE LINK
  // =====================================================

  function isActive(path) {

    return (
      location.pathname ===
      path
    )
  }


  // =====================================================
  // FIRST LETTER
  // =====================================================

  const firstLetter =
    studentName
      .charAt(0)
      .toUpperCase()


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="student-dashboard">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="student-sidebar">


        {/* LOGO */}

        <div className="student-sidebar-logo">

          <h2>
            🎵 Tantra Academy
          </h2>

          <span>
            Student Portal
          </span>

        </div>


        {/* NAVIGATION */}

        <nav>


          {/* DASHBOARD */}

          <Link
            to="/student-dashboard"
            className={
              isActive(
                "/student-dashboard"
              )
                ? "active"
                : ""
            }
          >

            <span>
              🏠
            </span>

            <span>
              Dashboard
            </span>

          </Link>


          {/* MY SONGS */}

          <Link
            to="/my-songs"
            className={
              isActive(
                "/my-songs"
              )
                ? "active"
                : ""
            }
          >

            <span>
              🎵
            </span>

            <span>
              My Songs
            </span>

          </Link>


          {/* TASKS */}

          <Link
            to="/tasks"
            className={
              isActive(
                "/tasks"
              )
                ? "active"
                : ""
            }
          >

            <span>
              ✅
            </span>

            <span>
              Tasks
            </span>

          </Link>


          {/* SCHEDULE */}

          <Link
            to="/schedule"
            className={
              isActive(
                "/schedule"
              )
                ? "active"
                : ""
            }
          >

            <span>
              🗓️
            </span>

            <span>
              Schedule
            </span>

          </Link>


          {/* PAYMENTS */}

          <Link
            to="/payments"
            className={
              isActive(
                "/payments"
              )
                ? "active"
                : ""
            }
          >

            <span>
              💳
            </span>

            <span>
              Payments
            </span>

          </Link>


          {/* EVENTS */}

          <Link
            to="/events"
            className={
              isActive(
                "/events"
              )
                ? "active"
                : ""
            }
          >

            <span>
              🎫
            </span>

            <span>
              Events
            </span>

          </Link>


          {/* MY BOOKINGS */}

          <Link
            to="/my-bookings"
            className={
              isActive(
                "/my-bookings"
              )
                ? "active"
                : ""
            }
          >

            <span>
              🎟️
            </span>

            <span>
              My Tickets
            </span>

          </Link>


          {/* ATTENDANCE */}

          <Link
            to="/student-attendance"
            className={
              isActive(
                "/student-attendance"
              )
                ? "active"
                : ""
            }
          >

            <span>
              📊
            </span>

            <span>
              Attendance
            </span>

          </Link>


          {/* GALLERY */}

          <Link
            to="/gallery"
            className={
              isActive(
                "/gallery"
              )
                ? "active"
                : ""
            }
          >

            <span>
              🖼️
            </span>

            <span>
              Gallery
            </span>

          </Link>


          {/* FEEDBACK */}

          <Link
            to="/feedback"
            className={
              isActive(
                "/feedback"
              )
                ? "active"
                : ""
            }
          >

            <span>
              💬
            </span>

            <span>
              Feedback
            </span>

          </Link>


          {/* HISTORY */}

          <Link
            to="/history"
            className={
              isActive(
                "/history"
              )
                ? "active"
                : ""
            }
          >

            <span>
              📜
            </span>

            <span>
              History
            </span>

          </Link>


          {/* NOTIFICATIONS */}

          <Link
            to="/notifications"
            className={
              `notification-sidebar-link ${
                isActive(
                  "/notifications"
                )
                  ? "active"
                  : ""
              }`
            }
          >

            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px"
              }}
            >

              <span>
                🔔
              </span>

              <span>
                Notifications
              </span>

            </span>


            {unreadNotifications > 0 && (

              <span
                style={{
                  minWidth: "28px",
                  height: "28px",
                  padding: "0 8px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  background:
                    "#ff4f70",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "800"
                }}
              >

                {unreadNotifications}

              </span>

            )}

          </Link>


          {/* SETTINGS */}

          <Link
            to="/settings"
            className={
              isActive(
                "/settings"
              )
                ? "active"
                : ""
            }
          >

            <span>
              ⚙️
            </span>

            <span>
              Settings
            </span>

          </Link>

        </nav>


        {/* LOGOUT */}

        <div
          className="student-sidebar-bottom"
        >

          <button
            type="button"
            className="student-logout-btn"
            onClick={
              handleLogout
            }
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="student-main">


        {/* HEADER */}

        <header className="student-header">

          <div>

            <p
              style={{
                margin: 0,
                color: "#6d4aff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "2px"
              }}
            >
              STUDENT DASHBOARD
            </p>


            <h1>

              Welcome back,{" "}
              {studentName}! 👋

            </h1>


            <p>
              Continue your musical
              journey with Tantra Academy.
            </p>

          </div>


          <div
            className="student-header-actions"
          >

            <Link
              to="/notifications"
              className="dashboard-notification-btn"
              style={{
                position: "relative",
                textDecoration: "none"
              }}
            >

              🔔

              {unreadNotifications > 0 && (

                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background:
                      "#ff4f70",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: "800",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center"
                  }}
                >
                  {unreadNotifications}
                </span>

              )}

            </Link>


            <div
              className="student-profile-mini"
            >

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background:
                    "#eee8ff",
                  color: "#6d4aff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontWeight: "800"
                }}
              >
                {firstLetter}
              </div>


              <div>

                <strong>
                  {studentName}
                </strong>

                <small>
                  {studentCourse}
                </small>

              </div>

            </div>

          </div>

        </header>


        {/* STAT CARDS */}

        <section
          className="student-stat-grid"
        >

          {/* MY SONGS */}

          <Link
            to="/my-songs"
            className="student-stat-card"
            style={{
              textDecoration:
                "none"
            }}
          >

            <div
              className="student-stat-icon"
            >
              🎵
            </div>

            <div>

              <span>
                MY SONGS
              </span>

              <h2>
                {songs.length}
              </h2>

              <p>
                Songs assigned
              </p>

            </div>

          </Link>


          {/* TASKS */}

          <Link
            to="/tasks"
            className="student-stat-card"
            style={{
              textDecoration:
                "none"
            }}
          >

            <div
              className="student-stat-icon"
            >
              ✅
            </div>

            <div>

              <span>
                TASKS
              </span>

              <h2>
                {pendingTasks}
              </h2>

              <p>
                Tasks pending
              </p>

            </div>

          </Link>


          {/* ATTENDANCE */}

          <Link
            to="/student-attendance"
            className="student-stat-card"
            style={{
              textDecoration:
                "none"
            }}
          >

            <div
              className="student-stat-icon"
            >
              📊
            </div>

            <div>

              <span>
                ATTENDANCE
              </span>

              <h2>
                {attendancePercentage}%
              </h2>

              <p>
                Overall attendance
              </p>

            </div>

          </Link>


          {/* FEE */}

          <Link
            to="/payments"
            className="student-stat-card"
            style={{
              textDecoration:
                "none"
            }}
          >

            <div
              className="student-stat-icon"
            >
              💳
            </div>

            <div>

              <span>
                FEE STATUS
              </span>

              <h2
                style={{
                  fontSize:
                    "22px"
                }}
              >
                {feeStatus}
              </h2>

              <p>
                Monthly fee
              </p>

            </div>

          </Link>

        </section>


        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section
          className="student-dashboard-section"
        >

          <div
            className="student-section-header"
          >

            <div>

              <p>
                QUICK ACCESS
              </p>

              <h2>
                Your Academy
              </h2>

            </div>

          </div>


          <div
            className="quick-actions-grid"
          >

            <Link
              to="/my-songs"
            >

              <span>
                🎵
              </span>

              <strong>
                My Songs
              </strong>

              <small>
                Learn your assigned songs
              </small>

            </Link>


            <Link
              to="/tasks"
            >

              <span>
                ✅
              </span>

              <strong>
                Tasks
              </strong>

              <small>
                View your practice tasks
              </small>

            </Link>


            {/* FIXED SCHEDULE ROUTE */}

            <Link
              to="/schedule"
            >

              <span>
                🗓️
              </span>

              <strong>
                Schedule
              </strong>

              <small>
                Check upcoming classes
              </small>

            </Link>


            <Link
              to="/student-attendance"
            >

              <span>
                📊
              </span>

              <strong>
                Attendance
              </strong>

              <small>
                View your attendance
              </small>

            </Link>


            <Link
              to="/payments"
            >

              <span>
                💳
              </span>

              <strong>
                Payments
              </strong>

              <small>
                Check fee status
              </small>

            </Link>


            <Link
              to="/events"
            >

              <span>
                🎫
              </span>

              <strong>
                Events
              </strong>

              <small>
                Explore academy events
              </small>

            </Link>

          </div>

        </section>


        {/* =================================================
            DASHBOARD CONTENT
        ================================================= */}

        <section
          className="student-dashboard-grid"
        >

          {/* TODAY'S SONG */}

          <div
            className="student-dashboard-card"
          >

            <p
              className="card-label"
            >
              TODAY'S SONG
            </p>


            {songs.length === 0 ? (

              <div
                className="empty-dashboard-state"
              >

                <div>
                  🎵
                </div>

                <h3>
                  No songs assigned yet
                </h3>

                <p>
                  Your teacher will
                  assign songs here.
                </p>

              </div>

            ) : (

              <>

                <div
                  className="today-song-content"
                >

                  <div
                    className="song-cover-small"
                  >
                    🎵
                  </div>


                  <div>

                    <h3>
                      {
                        songs[0].title ||
                        "Song"
                      }
                    </h3>

                    <p>
                      {
                        songs[0].artist ||
                        songs[0].course ||
                        "Music Practice"
                      }
                    </p>


                    <div
                      className="song-progress-bar"
                    >

                      <div
                        className="song-progress-fill"
                        style={{
                          width:
                            "0%"
                        }}
                      />

                    </div>


                    <span>
                      Start practicing
                    </span>

                  </div>

                </div>


                <Link
                  to="/my-songs"
                  className="dashboard-card-link"
                >
                  View all songs →
                </Link>

              </>

            )}

          </div>


          {/* ATTENDANCE */}

          <div
            className="student-dashboard-card"
          >

            <p
              className="card-label"
            >
              ATTENDANCE
            </p>


            <div
              className="attendance-dashboard-content"
            >

              <div
                className="attendance-circle"
                style={{
                  "--attendance":
                    `${attendancePercentage * 3.6}deg`
                }}
              >

                <span>
                  {attendancePercentage}%
                </span>

              </div>


              <div>

                <h3>
                  Overall Attendance
                </h3>

                <p>
                  {presentClasses}
                  {" "}
                  present out of
                  {" "}
                  {totalClasses}
                  {" "}
                  classes
                </p>


                <Link
                  to="/student-attendance"
                  className="dashboard-card-link"
                >
                  View Attendance →
                </Link>

              </div>

            </div>

          </div>


          {/* TASKS */}

          <div
            className="student-dashboard-card"
          >

            <p
              className="card-label"
            >
              TASKS
            </p>


            {tasks.length === 0 ? (

              <div
                className="empty-dashboard-state"
              >

                <div>
                  ✅
                </div>

                <h3>
                  No tasks available
                </h3>

                <p>
                  New tasks will
                  appear here.
                </p>

              </div>

            ) : (

              <div
                className="dashboard-task-list"
              >

                {tasks
                  .slice(0, 4)
                  .map(
                    (
                      task,
                      index
                    ) => (

                      <div
                        className="dashboard-task-item"
                        key={
                          task.id ||
                          task._id ||
                          index
                        }
                      >

                        <div
                          className="task-check-icon"
                        >
                          ✓
                        </div>

                        <div>

                          <h3>
                            {
                              task.title ||
                              "Practice Task"
                            }
                          </h3>

                          <p>
                            {
                              task.course ||
                              "Music Practice"
                            }
                          </p>

                        </div>

                      </div>

                    )
                  )}

              </div>

            )}


            <Link
              to="/tasks"
              className="dashboard-card-link"
            >
              View all tasks →
            </Link>

          </div>


          {/* FEE STATUS */}

          <div
            className="student-dashboard-card"
          >

            <p
              className="card-label"
            >
              FEE STATUS
            </p>


            <div
              className="fee-dashboard-content"
            >

              <span
                className={
                  `fee-status ${
                    feeStatus.toLowerCase()
                  }`
                }
              >

                {feeStatus === "Paid"
                  ? "✓ Paid"
                  : "⏳ Pending"}

              </span>


              {latestFee ? (

                <>

                  <h3>
                    ₹
                    {Number(
                      latestFee.amount ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </h3>

                  <p>
                    {
                      latestFee.month ||
                      "Monthly fee"
                    }
                  </p>

                </>

              ) : (

                <>

                  <h3>
                    No fee assigned
                  </h3>

                  <p>
                    Fee details will
                    appear here.
                  </p>

                </>

              )}


              <Link
                to="/payments"
                className="dashboard-action-btn"
              >
                View Payments →
              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            YOUR ACCOUNT
        ================================================= */}

        <section
          className="student-dashboard-card"
          style={{
            marginTop: "20px"
          }}
        >

          <p
            className="card-label"
          >
            YOUR ACCOUNT
          </p>


          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "18px",
              flexWrap: "wrap"
            }}
          >

            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius:
                  "15px",
                background:
                  "#eee8ff",
                color:
                  "#6d4aff",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "22px",
                fontWeight:
                  "800"
              }}
            >
              {firstLetter}
            </div>


            <div
              style={{
                flex: 1
              }}
            >

              <h3
                style={{
                  margin:
                    "0 0 5px"
                }}
              >
                {studentName}
              </h3>


              <p
                style={{
                  margin: 0
                }}
              >
                {student.email ||
                  "Student account"}
              </p>


              <p
                style={{
                  margin:
                    "5px 0 0"
                }}
              >
                {studentCourse}
              </p>

            </div>


            <Link
              to="/settings"
              className="dashboard-action-btn"
            >
              Account Settings
            </Link>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="student-dashboard-footer"
        >

          <p>
            © 2026 Tantra Academy
          </p>

          <span>
            Learn • Practice • Perform 🎵
          </span>

        </footer>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <div
          className="student-dashboard-logout-section"
        >

          <button
            type="button"
            className="student-logout-main-btn"
            onClick={
              handleLogout
            }
          >
            🚪 Logout
          </button>

        </div>

      </main>

    </div>
  )
}


export default StudentDashboard