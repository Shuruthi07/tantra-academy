import { useEffect, useState } from "react"

const NOTIFICATIONS_API =
  "https://tantra-academy-1.onrender.com/api/notifications"

const STUDENTS_API =
  "https://tantra-academy-1.onrender.com/api/admin/students"


function TeacherNotifications() {

  const [notifications, setNotifications] =
    useState([])

  const [title, setTitle] =
    useState("")

  const [message, setMessage] =
    useState("")

  const [type, setType] =
    useState("Announcement")

  const [showForm, setShowForm] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [error, setError] =
    useState("")


  // =========================================
  // JWT AUTH HEADERS
  // =========================================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      Authorization:
        "Bearer " + token
    }
  }


  // =========================================
  // GET LOGGED-IN TEACHER
  // =========================================

  function getLoggedInTeacher() {

    try {

      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (storedUser) {

        return JSON.parse(
          storedUser
        )

      }

    } catch (error) {

      console.error(
        "Teacher session error:",
        error
      )

    }


    return null

  }


  // =========================================
  // GET TEACHER ID
  // =========================================

  function getTeacherId() {

    const teacher =
      getLoggedInTeacher()


    if (!teacher) {
      return ""
    }


    return String(
      teacher.id ||
      teacher._id ||
      teacher.userId ||
      ""
    ).trim()

  }


  // =========================================
  // GET NOTIFICATION ICON
  // =========================================

  function getNotificationIcon(
    notificationType
  ) {

    const normalizedType =
      String(
        notificationType || ""
      ).toLowerCase()


    if (
      normalizedType === "music"
    ) {

      return "🎵"

    }


    if (
      normalizedType === "class"
    ) {

      return "📅"

    }


    if (
      normalizedType === "task"
    ) {

      return "✅"

    }


    if (
      normalizedType === "event"
    ) {

      return "🎫"

    }


    if (
      normalizedType === "payment"
    ) {

      return "💳"

    }


    return "📢"

  }


  // =========================================
  // FORMAT TIME
  // =========================================

  function formatTime(
    createdAt
  ) {

    if (!createdAt) {
      return "Just now"
    }


    const date =
      new Date(createdAt)


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Just now"

    }


    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    )

  }


  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  async function loadNotifications() {

    try {

      setLoading(true)
      setError("")


      const teacherId =
        getTeacherId()


      if (!teacherId) {

        setNotifications([])

        setError(
          "Teacher session not found. Please login again."
        )

        return

      }


      const response =
        await fetch(
          `${NOTIFICATIONS_API}?userId=${encodeURIComponent(
            teacherId
          )}&_=${Date.now()}`,
          {
            method: "GET",

            cache: "no-store",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load notifications."
        )

      }


      setNotifications(
        Array.isArray(
          data.notifications
        )
          ? data.notifications
          : []
      )

    } catch (error) {

      console.error(
        "Notification loading error:",
        error
      )

      setNotifications([])

      setError(
        error.message ||
        "Unable to load notifications."
      )

    } finally {

      setLoading(false)

    }

  }


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    loadNotifications()


    function handleNotificationsUpdated() {

      loadNotifications()

    }


    window.addEventListener(
      "notificationsUpdated",
      handleNotificationsUpdated
    )

    window.addEventListener(
      "teacherNotificationsUpdated",
      handleNotificationsUpdated
    )


    return () => {

      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdated
      )

      window.removeEventListener(
        "teacherNotificationsUpdated",
        handleNotificationsUpdated
      )

    }

  }, [])


  // =========================================
  // ADD NOTIFICATION
  // =========================================

  async function addNotification(e) {

    e.preventDefault()


    const cleanTitle =
      title.trim()

    const cleanMessage =
      message.trim()


    if (
      !cleanTitle ||
      !cleanMessage
    ) {

      alert(
        "Please enter both title and message."
      )

      return

    }


    try {

      setSending(true)


      // =========================================
      // LOAD ALL STUDENTS
      // =========================================

      const studentsResponse =
        await fetch(
          STUDENTS_API,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      const studentsData =
        await studentsResponse.json()


      if (!studentsResponse.ok) {

        throw new Error(
          studentsData.message ||
          "Unable to load students."
        )

      }


      const students =
        Array.isArray(
          studentsData.students
        )
          ? studentsData.students
          : []


      if (students.length === 0) {

        alert(
          "No students are available."
        )

        return

      }


      // =========================================
      // SEND TO EVERY STUDENT
      // =========================================

      let successCount = 0


      for (
        const student of students
      ) {

        const studentId =
          String(
            student.id ||
            student._id ||
            student.userId ||
            ""
          ).trim()


        if (!studentId) {
          continue
        }


        const response =
          await fetch(
            NOTIFICATIONS_API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...getAuthHeaders()
              },

              body: JSON.stringify({

                userId:
                  studentId,

                title:
                  cleanTitle,

                message:
                  cleanMessage,

                type:
                  type

              })

            }
          )


        const data =
          await response.json()


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Unable to send notification."
          )

        }


        successCount += 1

      }


      // =========================================
      // RESET FORM
      // =========================================

      setTitle("")
      setMessage("")
      setType("Announcement")
      setShowForm(false)


      // =========================================
      // REFRESH
      // =========================================

      await loadNotifications()


      window.dispatchEvent(
        new Event(
          "notificationsUpdated"
        )
      )


      window.dispatchEvent(
        new Event(
          "teacherNotificationsUpdated"
        )
      )


      alert(
        `Notification sent successfully to ${successCount} student${
          successCount === 1
            ? ""
            : "s"
        }! 📢`
      )

    } catch (error) {

      console.error(
        "Notification creation error:",
        error
      )

      alert(
        error.message ||
        "Unable to send notification."
      )

    } finally {

      setSending(false)

    }

  }


  // =========================================
  // DELETE NOTIFICATION
  // =========================================

  async function deleteNotification(
    id
  ) {

    const confirmed =
      window.confirm(
        "Delete this notification?"
      )


    if (!confirmed) {
      return
    }


    try {

      const response =
        await fetch(
          `${NOTIFICATIONS_API}/${id}`,
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to delete notification."
        )

      }


      setNotifications(
        (previous) =>
          previous.filter(
            (notification) =>
              notification.id !== id
          )
      )


      window.dispatchEvent(
        new Event(
          "notificationsUpdated"
        )
      )

    } catch (error) {

      console.error(
        "Notification delete error:",
        error
      )

      alert(
        error.message ||
        "Unable to delete notification."
      )

    }

  }


  // =========================================
  // MARK ONE AS READ
  // =========================================

  async function markAsRead(
    notification
  ) {

    if (
      notification.read
    ) {

      return

    }


    try {

      const response =
        await fetch(
          `${NOTIFICATIONS_API}/${notification.id}/read`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to mark notification as read."
        )

      }


      setNotifications(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              notification.id
                ? {
                    ...item,
                    read: true
                  }
                : item
          )
      )

    } catch (error) {

      console.error(
        "Mark notification error:",
        error
      )

    }

  }


  // =========================================
  // MARK ALL AS READ
  // =========================================

  async function markAllAsRead() {

    const teacherId =
      getTeacherId()


    if (!teacherId) {
      return
    }


    try {

      const response =
        await fetch(
          `${NOTIFICATIONS_API}/read-all?userId=${encodeURIComponent(
            teacherId
          )}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to mark notifications as read."
        )

      }


      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true
            })
          )
      )

    } catch (error) {

      console.error(
        "Mark all notifications error:",
        error
      )

      alert(
        error.message ||
        "Unable to mark notifications as read."
      )

    }

  }


  // =========================================
  // CANCEL FORM
  // =========================================

  function cancelForm() {

    setTitle("")
    setMessage("")
    setType("Announcement")
    setShowForm(false)

  }


  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="teacher-notifications-page">

        <div className="teacher-notifications-header">

          <div>

            <p>
              STUDENT UPDATES
            </p>

            <h1>
              Notifications 🔔
            </h1>

            <span>
              Loading notifications...
            </span>

          </div>

        </div>


        <div className="teacher-no-notifications">

          <div>
            🔔
          </div>

          <h2>
            Loading...
          </h2>

          <p>
            Please wait while notifications
            are loaded.
          </p>

        </div>

      </div>

    )

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="teacher-notifications-page">


      {/* HEADER */}

      <div className="teacher-notifications-header">

        <div>

          <p>
            STUDENT UPDATES
          </p>

          <h1>
            Notifications 🔔
          </h1>

          <span>
            Create and manage notifications
            for your students.
          </span>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >

          <button
            type="button"
            className="secondary-button"
            onClick={loadNotifications}
          >
            🔄 Refresh
          </button>


          {unreadCount > 0 && (

            <button
              type="button"
              className="secondary-button"
              onClick={markAllAsRead}
            >
              ✓ Mark All Read
            </button>

          )}


          <button
            type="button"
            className="create-notification-btn"
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
          >
            {showForm
              ? "✕ Close"
              : "+ Create Notification"}
          </button>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="login-error">

          {error}

          <button
            type="button"
            onClick={loadNotifications}
            style={{
              marginLeft: "12px"
            }}
          >
            🔄 Retry
          </button>

        </div>

      )}


      {/* CREATE FORM */}

      {showForm && (

        <div className="teacher-notification-form-card">

          <h2>
            Create Notification
          </h2>

          <p>
            Send an update to all students.
          </p>


          <form
            onSubmit={
              addNotification
            }
          >

            {/* TITLE */}

            <div className="teacher-notification-form-group">

              <label>
                Notification Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Example: New song assigned"
              />

            </div>


            {/* TYPE */}

            <div className="teacher-notification-form-group">

              <label>
                Notification Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value
                  )
                }
              >

                <option value="Announcement">
                  📢 Announcement
                </option>

                <option value="Music">
                  🎵 Music
                </option>

                <option value="Class">
                  📅 Class
                </option>

                <option value="Task">
                  ✅ Task
                </option>

                <option value="Event">
                  🎫 Event
                </option>

                <option value="Payment">
                  💳 Payment
                </option>

              </select>

            </div>


            {/* MESSAGE */}

            <div className="teacher-notification-form-group">

              <label>
                Message
              </label>

              <textarea
                rows="4"
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Write your notification message..."
              />

            </div>


            {/* ACTIONS */}

            <div className="teacher-notification-form-actions">

              <button
                type="button"
                className="cancel-notification-btn"
                onClick={
                  cancelForm
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="save-notification-btn"
                disabled={sending}
              >
                {sending
                  ? "Sending..."
                  : "📢 Send Notification"}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* SUMMARY */}

      <div className="teacher-notification-summary">

        <div className="teacher-notification-summary-card">

          <span>
            Total
          </span>

          <h2>
            {notifications.length}
          </h2>

          <p>
            Notifications
          </p>

        </div>


        <div className="teacher-notification-summary-card">

          <span>
            Unread
          </span>

          <h2>
            {unreadCount}
          </h2>

          <p>
            Unread notifications
          </p>

        </div>

      </div>


      {/* NOTIFICATION LIST */}

      <div className="teacher-notification-list">

        {notifications.length === 0 ? (

          <div className="teacher-no-notifications">

            <div>
              🔔
            </div>

            <h2>
              No notifications yet
            </h2>

            <p>
              Teacher notifications for this
              account will appear here.
            </p>

          </div>

        ) : (

          notifications.map(
            (notification) => (

              <div
                className="teacher-notification-card"
                key={notification.id}
                style={{
                  opacity:
                    notification.read
                      ? 0.75
                      : 1
                }}
              >

                {/* ICON */}

                <div className="teacher-notification-icon">

                  {getNotificationIcon(
                    notification.type
                  )}

                </div>


                {/* CONTENT */}

                <div className="teacher-notification-content">

                  <div className="teacher-notification-top">

                    <span className="teacher-notification-type">

                      {notification.type ||
                        "Announcement"}

                    </span>


                    <span className="teacher-notification-time">

                      {formatTime(
                        notification.createdAt
                      )}

                    </span>

                  </div>


                  <h2>
                    {notification.title}
                  </h2>


                  <p>
                    {notification.message}
                  </p>


                  {!notification.read && (

                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(
                          notification
                        )
                      }
                      style={{
                        marginTop: "8px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      ✓ Mark as read
                    </button>

                  )}

                </div>


                {/* DELETE */}

                <button
                  type="button"
                  className="delete-notification-btn"
                  onClick={() =>
                    deleteNotification(
                      notification.id
                    )
                  }
                >
                  🗑
                </button>

              </div>

            )
          )

        )}

      </div>

    </div>

  )

}


export default TeacherNotifications