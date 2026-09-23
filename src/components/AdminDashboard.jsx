import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


const API_BASE =
  "http://127.0.0.1:5000"


const ADMIN_API =
  `${API_BASE}/api/admin`

const EVENTS_API =
  `${API_BASE}/api/events`

const GALLERY_API =
  `${API_BASE}/api/gallery`

const FEEDBACK_API =
  `${API_BASE}/api/feedback`

const NOTIFICATIONS_API =
  `${API_BASE}/api/notifications`


function AdminDashboard() {

  const navigate = useNavigate()


  const [students, setStudents] =
    useState([])

  const [teachers, setTeachers] =
    useState([])

  const [songs, setSongs] =
    useState([])

  const [tasks, setTasks] =
    useState([])

  const [events, setEvents] =
    useState([])

  const [gallery, setGallery] =
    useState([])

  const [feedback, setFeedback] =
    useState([])

  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


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
  // LOAD ADMIN DATA
  // =====================================================

  async function loadDashboard() {

    try {

      setLoading(true)

      setError("")


      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )


      if (!token) {

        navigate(
          "/login",
          {
            replace: true
          }
        )

        return

      }


      // =================================================
      // STUDENTS
      // =================================================

      const studentsResponse =
        await fetch(
          `${ADMIN_API}/students?_=${Date.now()}`,
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
        studentsResponse.status === 401 ||
        studentsResponse.status === 403
      ) {

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

        return

      }


      if (
        studentsResponse.ok &&
        studentsData.success
      ) {

        setStudents(
          Array.isArray(
            studentsData.students
          )
            ? studentsData.students
            : []
        )

      }


      // =================================================
      // TEACHERS
      // =================================================

      const teachersResponse =
        await fetch(
          `${ADMIN_API}/teachers?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const teachersData =
        await teachersResponse.json()


      if (
        teachersResponse.ok &&
        teachersData.success
      ) {

        setTeachers(
          Array.isArray(
            teachersData.teachers
          )
            ? teachersData.teachers
            : []
        )

      }


      // =================================================
      // SONGS
      // =================================================

      const songsResponse =
        await fetch(
          `${ADMIN_API}/songs?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const songsData =
        await songsResponse.json()


      if (
        songsResponse.ok &&
        songsData.success
      ) {

        setSongs(
          Array.isArray(
            songsData.songs
          )
            ? songsData.songs
            : []
        )

      }


      // =================================================
      // TASKS
      // =================================================

      const tasksResponse =
        await fetch(
          `${ADMIN_API}/tasks?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const tasksData =
        await tasksResponse.json()


      if (
        tasksResponse.ok &&
        tasksData.success
      ) {

        setTasks(
          Array.isArray(
            tasksData.tasks
          )
            ? tasksData.tasks
            : []
        )

      }


      // =================================================
      // EVENTS
      // =================================================

      const eventsResponse =
        await fetch(
          `${EVENTS_API}/?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const eventsData =
        await eventsResponse.json()


      if (
        eventsResponse.ok &&
        eventsData.success
      ) {

        setEvents(
          Array.isArray(
            eventsData.events
          )
            ? eventsData.events
            : []
        )

      }


      // =================================================
      // GALLERY
      // =================================================

      const galleryResponse =
        await fetch(
          `${GALLERY_API}/?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )


      const galleryData =
        await galleryResponse.json()


      if (
        galleryResponse.ok &&
        galleryData.success
      ) {

        setGallery(
          Array.isArray(
            galleryData.gallery
          )
            ? galleryData.gallery
            : []
        )

      }


      // =================================================
      // FEEDBACK
      // =================================================

      try {

        const feedbackResponse =
          await fetch(
            `${FEEDBACK_API}/?_=${Date.now()}`,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
              cache: "no-store"
            }
          )


        const feedbackData =
          await feedbackResponse.json()


        if (
          feedbackResponse.ok &&
          feedbackData.success
        ) {

          setFeedback(
            Array.isArray(
              feedbackData.feedback
            )
              ? feedbackData.feedback
              : []
          )

        }

      } catch (feedbackError) {

        console.warn(
          "Feedback loading error:",
          feedbackError
        )

      }


      // =================================================
      // NOTIFICATIONS
      // =================================================

      try {

        const notificationsResponse =
          await fetch(
            `${NOTIFICATIONS_API}/?_=${Date.now()}`,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
              cache: "no-store"
            }
          )


        const notificationsData =
          await notificationsResponse.json()


        if (
          notificationsResponse.ok &&
          notificationsData.success
        ) {

          setNotifications(
            Array.isArray(
              notificationsData.notifications
            )
              ? notificationsData.notifications
              : []
          )

        }

      } catch (notificationError) {

        console.warn(
          "Notification loading error:",
          notificationError
        )

      }

    } catch (error) {

      console.error(
        "Admin dashboard error:",
        error
      )


      setError(
        "Unable to load dashboard data. Please check the backend."
      )

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadDashboard()

  }, [])


  // =====================================================
  // LISTEN FOR DATA UPDATES
  // =====================================================

  useEffect(() => {

    const events = [

      "studentsUpdated",
      "teachersUpdated",
      "songsUpdated",
      "tasksUpdated",
      "eventsUpdated",
      "galleryUpdated",
      "feedbackUpdated",
      "notificationsUpdated",
      "attendanceUpdated",
      "feesUpdated"

    ]


    function handleUpdate() {

      loadDashboard()

    }


    events.forEach(
      eventName => {

        window.addEventListener(
          eventName,
          handleUpdate
        )

      }
    )


    return () => {

      events.forEach(
        eventName => {

          window.removeEventListener(
            eventName,
            handleUpdate
          )

        }
      )

    }

  }, [])


  // =====================================================
  // MANAGEMENT CARD
  // =====================================================

  function ManagementCard({
    icon,
    title,
    description,
    count,
    path
  }) {

    return (

      <button
        type="button"
        className="admin-management-card"
        onClick={() =>
          navigate(path)
        }
      >

        <div className="admin-management-icon">
          {icon}
        </div>


        <div className="admin-management-content">

          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>

        </div>


        <div className="admin-management-count">
          {count}
        </div>


        <div className="admin-management-arrow">
          →
        </div>

      </button>

    )

  }


  // =====================================================
  // OVERVIEW CARD
  // =====================================================

  function OverviewCard({
    icon,
    title,
    value,
    description
  }) {

    return (

      <div className="admin-overview-card">

        <div className="admin-overview-icon">
          {icon}
        </div>


        <div>

          <p>
            {title}
          </p>

          <h2>
            {value}
          </h2>

          <span>
            {description}
          </span>

        </div>

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-dashboard-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-dashboard-header">

        <div>

          <p className="admin-label">
            ADMIN PANEL
          </p>

          <h1>
            Admin Dashboard 👑
          </h1>

          <p>
            Welcome to Tantra Academy
            administration.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >

          {loading
            ? "⏳ Loading..."
            : "🔄 Refresh"}

        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="admin-error">

          {error}

          <button
            type="button"
            onClick={loadDashboard}
            style={{
              marginLeft: "12px"
            }}
          >
            Retry
          </button>

        </div>

      )}


      {/* =================================================
          OVERVIEW
      ================================================= */}

      <div className="admin-overview-grid">

        <OverviewCard
          icon="👨‍🎓"
          title="Students"
          value={
            loading
              ? "..."
              : students.length
          }
          description="Registered students"
        />


        <OverviewCard
          icon="👨‍🏫"
          title="Teachers"
          value={
            loading
              ? "..."
              : teachers.length
          }
          description="Registered teachers"
        />


        <OverviewCard
          icon="🎵"
          title="Songs"
          value={
            loading
              ? "..."
              : songs.length
          }
          description="Academy songs"
        />


        <OverviewCard
          icon="📝"
          title="Tasks"
          value={
            loading
              ? "..."
              : tasks.length
          }
          description="Learning tasks"
        />


        <OverviewCard
          icon="🎫"
          title="Events"
          value={
            loading
              ? "..."
              : events.length
          }
          description="Academy events"
        />


        <OverviewCard
          icon="🖼️"
          title="Gallery"
          value={
            loading
              ? "..."
              : gallery.length
          }
          description="Gallery items"
        />

      </div>


      {/* =================================================
          MANAGEMENT
      ================================================= */}

      <div className="admin-section-header">

        <div>

          <p className="admin-label">
            MANAGEMENT
          </p>

          <h2>
            Academy Management
          </h2>

          <span>
            Manage all major Tantra Academy
            features from one place.
          </span>

        </div>

      </div>


      <div className="admin-management-grid">


        {/* STUDENTS */}

        <ManagementCard
          icon="👨‍🎓"
          title="Students"
          description="View and manage registered students."
          count={
            loading
              ? "..."
              : students.length
          }
          path="/admin-students"
        />


        {/* TEACHERS */}

        <ManagementCard
          icon="👨‍🏫"
          title="Teachers"
          description="View and manage academy teachers."
          count={
            loading
              ? "..."
              : teachers.length
          }
          path="/admin-teachers"
        />


        {/* SONGS */}

        <ManagementCard
          icon="🎵"
          title="Songs"
          description="Add, edit and assign songs."
          count={
            loading
              ? "..."
              : songs.length
          }
          path="/admin-songs"
        />


        {/* TASKS */}

        <ManagementCard
          icon="📝"
          title="Tasks"
          description="Create and manage student tasks."
          count={
            loading
              ? "..."
              : tasks.length
          }
          path="/admin-tasks"
        />


        {/* SCHEDULE */}

        <ManagementCard
          icon="📅"
          title="Schedule"
          description="Manage academy class schedules."
          count="→"
          path="/admin-schedule"
        />


        {/* FEES */}

        <ManagementCard
          icon="💳"
          title="Fees"
          description="Manage student fees and payments."
          count="→"
          path="/admin-fees"
        />


        {/* EVENTS */}

        <ManagementCard
          icon="🎫"
          title="Events"
          description="Create and manage academy events."
          count={
            loading
              ? "..."
              : events.length
          }
          path="/admin-events"
        />


        {/* GALLERY */}

        <ManagementCard
          icon="🖼️"
          title="Gallery"
          description="Manage academy photos and gallery."
          count={
            loading
              ? "..."
              : gallery.length
          }
          path="/admin-gallery"
        />


        {/* FEEDBACK */}

        <ManagementCard
          icon="💬"
          title="Feedback"
          description="View student feedback and responses."
          count={
            loading
              ? "..."
              : feedback.length
          }
          path="/admin-feedback"
        />


        {/* ATTENDANCE */}

        <ManagementCard
          icon="✅"
          title="Attendance"
          description="View and manage student attendance."
          count="→"
          path="/admin-attendance"
        />


        {/* NOTIFICATIONS */}

        <ManagementCard
          icon="🔔"
          title="Notifications"
          description="View academy notifications."
          count={
            loading
              ? "..."
              : notifications.length
          }
          path="/admin-notifications"
        />

      </div>


      {/* =================================================
          QUICK OVERVIEW
      ================================================= */}

      <div className="admin-section-header">

        <div>

          <p className="admin-label">
            QUICK OVERVIEW
          </p>

          <h2>
            System Status
          </h2>

        </div>

      </div>


      <div className="admin-system-grid">


        <div className="admin-system-card">

          <div className="admin-system-icon">
            🟢
          </div>

          <div>

            <h3>
              Backend
            </h3>

            <p>
              Connected to Tantra Academy API
            </p>

          </div>

        </div>


        <div className="admin-system-card">

          <div className="admin-system-icon">
            🟢
          </div>

          <div>

            <h3>
              Database
            </h3>

            <p>
              MongoDB academy database
            </p>

          </div>

        </div>


        <div className="admin-system-card">

          <div className="admin-system-icon">
            🔐
          </div>

          <div>

            <h3>
              Authentication
            </h3>

            <p>
              JWT protected admin session
            </p>

          </div>

        </div>


        <div className="admin-system-card">

          <div className="admin-system-icon">
            📡
          </div>

          <div>

            <h3>
              Live Updates
            </h3>

            <p>
              Dashboard refreshes after changes
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="admin-dashboard-footer">

        <div>

          <strong>
            🎵 Tantra Academy
          </strong>

          <span>
            Music Academy Management Platform
          </span>

        </div>

        <span>
          Admin Control Center
        </span>

      </div>


    </div>

  )

}


export default AdminDashboard