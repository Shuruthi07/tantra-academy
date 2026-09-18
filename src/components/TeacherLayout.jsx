import { NavLink, Outlet } from "react-router-dom"

function TeacherLayout() {

  return (
    <div className="teacher-layout">

      {/* SIDEBAR */}

      <aside className="teacher-sidebar">

        <div className="teacher-logo">
          🎵 TANTRA ACADEMY
        </div>


        <nav className="teacher-menu">

          <NavLink to="/teacher-dashboard">
            🏠 Dashboard
          </NavLink>

          <NavLink to="/teacher-students">
            👨‍🎓 Students
          </NavLink>

          <NavLink to="/teacher-profile">
            👤 Profile
          </NavLink>

          <NavLink to="/teacher-attendance">
            📊 Attendance
          </NavLink>

          <NavLink to="/teacher-fees">
            💳 Fees
          </NavLink>

          <NavLink to="/teacher-songs">
            🎵 Songs
          </NavLink>

          <NavLink to="/teacher-song-progress">
            📊 Song Progress
          </NavLink>

          <NavLink to="/teacher-tasks">
            ✅ Tasks
          </NavLink>

          <NavLink to="/teacher-notifications">
            🔔 Notifications
          </NavLink>

          <NavLink to="/teacher-schedule">
            📅 Schedule
          </NavLink>

          <NavLink to="/teacher-events">
            🎫 Events
          </NavLink>

          <NavLink to="/teacher-gallery">
            🖼 Gallery
          </NavLink>

          <NavLink to="/teacher-feedback">
            💬 Feedback
          </NavLink>

        </nav>

      </aside>


      {/* MAIN CONTENT */}

      <main className="teacher-layout-content">
        <Outlet />
      </main>

    </div>
  )
}

export default TeacherLayout