import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function StudentDashboard() {

  const navigate = useNavigate()

  const [student, setStudent] = useState({
    name: "Student",
    email: "",
    phone: ""
  })

  const [notificationCount, setNotificationCount] = useState(0)

  const [stats, setStats] = useState({
    songs: 0,
    tasks: 0,
    attendance: 0,
    fees: "Paid"
  })


  // Load student profile
  useEffect(() => {

    const savedProfile =
      JSON.parse(
        localStorage.getItem("tantraStudentProfile")
      )

    const loggedInUser =
      JSON.parse(
        localStorage.getItem("tantraLoggedInUser")
      )

    if (savedProfile) {

      setStudent(savedProfile)

    } else if (loggedInUser) {

      setStudent({
        name: loggedInUser.name || "Student",
        email: loggedInUser.email || "",
        phone: loggedInUser.phone || ""
      })

    }

  }, [])


  // Load dashboard data
  useEffect(() => {

    function loadDashboardData() {

      const songs =
        JSON.parse(
          localStorage.getItem("tantraSongs")
        ) || []

      const tasks =
        JSON.parse(
          localStorage.getItem("tantraTasks")
        ) || []

      const attendance =
        JSON.parse(
          localStorage.getItem("tantraAttendance")
        ) || []

      const fees =
        JSON.parse(
          localStorage.getItem("tantraFees")
        ) || []


      const completedTasks =
        tasks.filter(
          (task) =>
            task.completed === true ||
            task.status === "Completed"
        ).length


      const presentCount =
        attendance.filter(
          (item) =>
            item.status === "Present"
        ).length

      const totalAttendance =
        attendance.length

      const attendancePercentage =
        totalAttendance > 0
          ? Math.round(
              (presentCount / totalAttendance) * 100
            )
          : 0


      let feeStatus = "Paid"

      if (fees.length > 0) {

        const pendingFees =
          fees.filter(
            (fee) =>
              fee.status === "Pending"
          )

        if (pendingFees.length > 0) {
          feeStatus = "Pending"
        }
      }


      setStats({
        songs: songs.length,
        tasks: completedTasks,
        attendance: attendancePercentage,
        fees: feeStatus
      })

    }


    loadDashboardData()


    window.addEventListener(
      "storage",
      loadDashboardData
    )

    window.addEventListener(
      "songsUpdated",
      loadDashboardData
    )

    window.addEventListener(
      "tasksUpdated",
      loadDashboardData
    )

    window.addEventListener(
      "attendanceUpdated",
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
        "songsUpdated",
        loadDashboardData
      )

      window.removeEventListener(
        "tasksUpdated",
        loadDashboardData
      )

      window.removeEventListener(
        "attendanceUpdated",
        loadDashboardData
      )

      window.removeEventListener(
        "feesUpdated",
        loadDashboardData
      )

    }

  }, [])


  // Notification count
  useEffect(() => {

    function loadNotifications() {

      const studentNotifications =
        JSON.parse(
          localStorage.getItem(
            "tantraNotifications"
          )
        ) || []


      const teacherNotifications =
        JSON.parse(
          localStorage.getItem(
            "tantraTeacherNotifications"
          )
        ) || []


      const allNotifications = [
        ...teacherNotifications,
        ...studentNotifications
      ]


      const unreadCount =
        allNotifications.filter(
          (notification) =>
            notification.unread === true
        ).length


      setNotificationCount(
        unreadCount
      )

    }


    loadNotifications()


    window.addEventListener(
      "storage",
      loadNotifications
    )

    window.addEventListener(
      "notificationsUpdated",
      loadNotifications
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadNotifications
      )

      window.removeEventListener(
        "notificationsUpdated",
        loadNotifications
      )

    }

  }, [])


  // Logout
  function handleLogout() {

    localStorage.removeItem(
      "tantraLoggedInUser"
    )

    navigate("/login", {
      replace: true
    })

  }


  return (

    <div className="student-dashboard">

      {/* Sidebar */}

      <aside className="student-sidebar">

        <div className="student-sidebar-logo">

          <div className="student-logo-icon">
            🎵
          </div>

          <div>
            <h2>
              Tantra Academy
            </h2>

            <span>
              Student Portal
            </span>
          </div>

        </div>


        <nav className="student-sidebar-nav">

          <Link
            to="/student-dashboard"
            className="active"
          >
            🏠 Dashboard
          </Link>


          <Link to="/my-songs">
            🎵 My Songs
          </Link>


          <Link to="/tasks">
            ✅ Tasks
          </Link>


          <Link to="/schedule">
            📅 Schedule
          </Link>


          <Link to="/payments">
            💳 Payments
          </Link>


          <Link to="/events">
            🎫 Events
          </Link>


          <Link to="/my-bookings">
            🎟 My Tickets
          </Link>


          <Link to="/gallery">
            🖼 Gallery
          </Link>


          <Link to="/feedback">
            💬 Feedback
          </Link>


          <Link to="/history">
            📜 History
          </Link>


          <Link to="/notifications">
            🔔 Notifications

            {notificationCount > 0 && (

              <span className="notification-badge">
                {notificationCount}
              </span>

            )}

          </Link>


          <Link to="/settings">
            ⚙ Settings
          </Link>

        </nav>


        <div className="student-sidebar-bottom">

          <button
            className="student-logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* Main Content */}

      <main className="student-dashboard-main">

        {/* Header */}

        <header className="student-dashboard-header">

          <div>

            <p className="dashboard-welcome-small">
              STUDENT DASHBOARD
            </p>

            <h1>
              Welcome, {student.name}! 👋
            </h1>

            <p>
              Continue your musical journey
              with Tantra Academy.
            </p>

          </div>


          <div className="student-header-actions">

            <Link
              to="/notifications"
              className="dashboard-notification-btn"
            >
              🔔

              {notificationCount > 0 && (

                <span>
                  {notificationCount}
                </span>

              )}

            </Link>


            <Link
              to="/settings"
              className="student-profile-mini"
            >

              <div className="student-avatar">
                {student.name
                  ? student.name
                      .charAt(0)
                      .toUpperCase()
                  : "S"}
              </div>

              <div>

                <strong>
                  {student.name}
                </strong>

                <small>
                  Student
                </small>

              </div>

            </Link>

          </div>

        </header>


        {/* Stats */}

        <section className="student-dashboard-stats">

          <div className="student-stat-card">

            <div className="student-stat-icon">
              🎵
            </div>

            <div>

              <span>
                MY SONGS
              </span>

              <h2>
                {stats.songs}
              </h2>

              <p>
                Songs assigned
              </p>

            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              ✅
            </div>

            <div>

              <span>
                TASKS
              </span>

              <h2>
                {stats.tasks}
              </h2>

              <p>
                Tasks completed
              </p>

            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              📊
            </div>

            <div>

              <span>
                ATTENDANCE
              </span>

              <h2>
                {stats.attendance}%
              </h2>

              <p>
                Overall attendance
              </p>

            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              💳
            </div>

            <div>

              <span>
                FEE STATUS
              </span>

              <h2>
                {stats.fees}
              </h2>

              <p>
                Monthly fee
              </p>

            </div>

          </div>

        </section>


        {/* Quick Actions */}

        <section className="student-dashboard-section">

          <div className="student-section-header">

            <div>

              <span>
                QUICK ACCESS
              </span>

              <h2>
                What would you like to do?
              </h2>

            </div>

          </div>


          <div className="quick-actions-grid">

            <Link to="/my-songs">

              <span>
                🎵
              </span>

              <strong>
                My Songs
              </strong>

              <small>
                Practice your assigned songs
              </small>

            </Link>


            <Link to="/tasks">

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


            <Link to="/schedule">

              <span>
                📅
              </span>

              <strong>
                Schedule
              </strong>

              <small>
                Check upcoming classes
              </small>

            </Link>


            <Link to="/payments">

              <span>
                💳
              </span>

              <strong>
                Payments
              </strong>

              <small>
                Manage your academy fees
              </small>

            </Link>


            <Link to="/events">

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


            <Link to="/gallery">

              <span>
                🖼
              </span>

              <strong>
                Gallery
              </strong>

              <small>
                View academy memories
              </small>

            </Link>

          </div>

        </section>


        {/* Your Teacher */}

        <section className="student-dashboard-section">

          <div className="student-section-header">

            <div>

              <span>
                YOUR TEACHER
              </span>

              <h2>
                Learn from your teacher
              </h2>

            </div>

            <Link to="/my-teacher">
              View Profile
            </Link>

          </div>


          <div className="fee-dashboard-content">

            <h3>
              Your Music Teacher
            </h3>

            <p>
              Your teacher guides you through
              songs, practice tasks, classes and
              musical development.
            </p>

            <Link
  to="/my-teacher"
  className="dashboard-action-btn"
>
              View Teacher Profile →
            </Link>

          </div>

        </section>


        {/* Account */}

        <section className="student-dashboard-section">

          <div className="student-section-header">

            <div>

              <span>
                ACCOUNT
              </span>

              <h2>
                Your Account
              </h2>

            </div>

          </div>


          <div className="fee-dashboard-content">

            <h3>
              {student.name}
            </h3>

            <p>
              📧 {student.email || "Email not available"}
            </p>

            <p>
              📱 {student.phone || "Phone not available"}
            </p>


            <Link
              to="/settings"
              className="dashboard-action-btn"
            >
              Manage Account →
            </Link>

          </div>

        </section>


        {/* Logout */}

        <section className="student-dashboard-logout-section">

          <button
            className="student-logout-main-btn"
            onClick={handleLogout}
          >
            🚪 Logout from Tantra Academy
          </button>

        </section>

      </main>

    </div>

  )
}

export default StudentDashboard