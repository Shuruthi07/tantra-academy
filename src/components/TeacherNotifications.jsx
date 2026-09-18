import { useEffect, useState } from "react"

function TeacherNotifications() {

  const [notifications, setNotifications] = useState(() => {
    return (
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []
    )
  })

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("Announcement")
  const [showForm, setShowForm] = useState(false)


  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  function loadNotifications() {

    const savedNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []

    setNotifications(savedNotifications)

  }


  // =========================================
  // LIVE UPDATE
  // =========================================

  useEffect(() => {

    loadNotifications()

    window.addEventListener(
      "storage",
      loadNotifications
    )

    window.addEventListener(
      "teacherNotificationsUpdated",
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
        "teacherNotificationsUpdated",
        loadNotifications
      )

      window.removeEventListener(
        "notificationsUpdated",
        loadNotifications
      )

    }

  }, [])


  // =========================================
  // GET ICON
  // =========================================

  function getNotificationIcon(notificationType) {

    if (notificationType === "Music") {
      return "🎵"
    }

    if (notificationType === "Class") {
      return "📅"
    }

    if (notificationType === "Task") {
      return "✅"
    }

    if (notificationType === "Event") {
      return "🎫"
    }

    return "📢"

  }


  // =========================================
  // ADD NOTIFICATION
  // =========================================

  function addNotification(e) {

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


    const newNotification = {

      id:
        Date.now() +
        Math.floor(
          Math.random() * 1000
        ),

      icon:
        getNotificationIcon(type),

      title:
        cleanTitle,

      message:
        cleanMessage,

      type:
        type,

      time:
        "Just now",

      unread:
        true

    }


    const updatedNotifications = [

      newNotification,

      ...notifications

    ]


    setNotifications(
      updatedNotifications
    )


    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify(
        updatedNotifications
      )
    )


    // Update Teacher Notifications

    window.dispatchEvent(
      new Event(
        "teacherNotificationsUpdated"
      )
    )


    // Update Student Notifications

    window.dispatchEvent(
      new Event(
        "notificationsUpdated"
      )
    )


    // RESET

    setTitle("")
    setMessage("")
    setType("Announcement")
    setShowForm(false)


    alert(
      "Notification sent successfully! 📢"
    )

  }


  // =========================================
  // DELETE NOTIFICATION
  // =========================================

  function deleteNotification(id) {

    const confirmed =
      window.confirm(
        "Delete this notification?"
      )


    if (!confirmed) {
      return
    }


    const updatedNotifications =
      notifications.filter(
        (notification) =>
          notification.id !== id
      )


    setNotifications(
      updatedNotifications
    )


    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify(
        updatedNotifications
      )
    )


    window.dispatchEvent(
      new Event(
        "teacherNotificationsUpdated"
      )
    )


    window.dispatchEvent(
      new Event(
        "notificationsUpdated"
      )
    )

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
  // SUMMARY
  // =========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length


  return (

    <div className="teacher-notifications-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="teacher-notifications-header">

        <div>

          <p>
            STUDENT UPDATES
          </p>

          <h1>
            Notifications 🔔
          </h1>

          <span>
            Create and manage notifications for your students.
          </span>

        </div>


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


      {/* =================================
          CREATE FORM
      ================================= */}

      {showForm && (

        <div className="teacher-notification-form-card">

          <h2>
            Create Notification
          </h2>

          <p>
            Send an update to your students.
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
              >
                📢 Send Notification
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="teacher-notification-summary">

        <div className="teacher-notification-summary-card">

          <span>
            Total
          </span>

          <h2>
            {notifications.length}
          </h2>

          <p>
            Notifications created
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
            Student notifications
          </p>

        </div>

      </div>


      {/* =================================
          NOTIFICATION LIST
      ================================= */}

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
              Create your first notification for students.
            </p>

          </div>

        ) : (

          notifications.map(
            (notification) => (

              <div
                className="teacher-notification-card"
                key={notification.id}
              >

                {/* ICON */}

                <div className="teacher-notification-icon">

                  {notification.icon ||
                    getNotificationIcon(
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

                      {notification.time ||
                        "Just now"}

                    </span>

                  </div>


                  <h2>
                    {notification.title}
                  </h2>


                  <p>
                    {notification.message}
                  </p>

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