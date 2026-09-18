
import { useEffect, useState } from "react"

const initialNotifications = [
  {
    id: "default-1",
    icon: "🎵",
    title: "New song assigned",
    message:
      "Your teacher assigned a new song: Someone Like You.",
    time: "10 minutes ago",
    type: "Music",
    unread: true
  },
  {
    id: "default-2",
    icon: "📅",
    title: "Upcoming class",
    message:
      "Your Vocal Training class starts today at 5:00 PM.",
    time: "1 hour ago",
    type: "Class",
    unread: true
  },
  {
    id: "default-3",
    icon: "✅",
    title: "Task reminder",
    message:
      "You have 4 pending practice tasks to complete.",
    time: "3 hours ago",
    type: "Task",
    unread: true
  },
  {
    id: "default-4",
    icon: "💳",
    title: "Fee payment successful",
    message:
      "Your September 2026 academy fee has been paid successfully.",
    time: "Yesterday",
    type: "Payment",
    unread: false
  },
  {
    id: "default-5",
    icon: "🎫",
    title: "Event registration open",
    message:
      "Registration is now open for the Inter Academy Singing Competition.",
    time: "Yesterday",
    type: "Event",
    unread: false
  },
  {
    id: "default-6",
    icon: "📢",
    title: "Academy announcement",
    message:
      "Annual Music Concert will be held on 25 September 2026.",
    time: "2 days ago",
    type: "Announcement",
    unread: false
  }
]


function Notifications() {

  const [notifications, setNotifications] =
    useState([])


  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  function loadNotifications() {

    const savedStudentNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraNotifications"
        )
      )

    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    // First time opening notifications

    if (!savedStudentNotifications) {

      localStorage.setItem(
        "tantraNotifications",
        JSON.stringify(
          initialNotifications
        )
      )

      setNotifications([
        ...teacherNotifications,
        ...initialNotifications
      ])

      return
    }


    setNotifications([
      ...teacherNotifications,
      ...savedStudentNotifications
    ])
  }


  // =========================
  // INITIAL LOAD + AUTO UPDATE
  // =========================

  useEffect(() => {

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


  // =========================
  // UNREAD COUNT
  // =========================

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length


  // =========================
  // MARK ONE AS READ
  // =========================

  function markAsRead(id) {

    const selectedNotification =
      notifications.find(
        (notification) =>
          notification.id === id
      )


    if (!selectedNotification) {
      return
    }


    // Update screen

    const updatedNotifications =
      notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                unread: false
              }
            : notification
      )


    setNotifications(
      updatedNotifications
    )


    // =========================
    // CHECK TEACHER NOTIFICATION
    // =========================

    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    const isTeacherNotification =
      teacherNotifications.some(
        (notification) =>
          notification.id === id
      )


    if (isTeacherNotification) {

      const updatedTeacherNotifications =
        teacherNotifications.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  unread: false
                }
              : notification
        )


      localStorage.setItem(
        "tantraTeacherNotifications",
        JSON.stringify(
          updatedTeacherNotifications
        )
      )

    } else {

      // =========================
      // NORMAL STUDENT NOTIFICATION
      // =========================

      const studentNotifications =
        JSON.parse(
          localStorage.getItem(
            "tantraNotifications"
          )
        ) || []


      const updatedStudentNotifications =
        studentNotifications.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  unread: false
                }
              : notification
        )


      localStorage.setItem(
        "tantraNotifications",
        JSON.stringify(
          updatedStudentNotifications
        )
      )
    }


    // Update dashboard badge

    window.dispatchEvent(
      new Event(
        "notificationsUpdated"
      )
    )
  }


  // =========================
  // MARK ALL AS READ
  // =========================

  function markAllAsRead() {

    const updatedNotifications =
      notifications.map(
        (notification) => ({
          ...notification,
          unread: false
        })
      )


    setNotifications(
      updatedNotifications
    )


    // =========================
    // STUDENT NOTIFICATIONS
    // =========================

    const studentNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraNotifications"
        )
      ) || []


    const updatedStudentNotifications =
      studentNotifications.map(
        (notification) => ({
          ...notification,
          unread: false
        })
      )


    localStorage.setItem(
      "tantraNotifications",
      JSON.stringify(
        updatedStudentNotifications
      )
    )


    // =========================
    // TEACHER NOTIFICATIONS
    // =========================

    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    const updatedTeacherNotifications =
      teacherNotifications.map(
        (notification) => ({
          ...notification,
          unread: false
        })
      )


    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify(
        updatedTeacherNotifications
      )
    )


    // Update dashboard badge

    window.dispatchEvent(
      new Event(
        "notificationsUpdated"
      )
    )
  }


  return (

    <div className="notifications-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="notifications-header">

        <div>

          <p>
            STAY UPDATED
          </p>

          <h1>
            Notifications 🔔
          </h1>

          <span>
            Stay updated with your classes,
            tasks and academy activities.
          </span>

        </div>


        {unreadCount > 0 && (

          <button
            className="mark-read-btn"
            onClick={markAllAsRead}
          >
            ✓ Mark all as read
          </button>

        )}

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <div className="notification-summary">

        <div className="notification-summary-card">

          <span>
            Unread
          </span>

          <h2>
            {unreadCount}
          </h2>

          <p>
            New notifications
          </p>

        </div>


        <div className="notification-summary-card">

          <span>
            Total
          </span>

          <h2>
            {notifications.length}
          </h2>

          <p>
            Recent notifications
          </p>

        </div>

      </div>


      {/* =========================
          NOTIFICATION LIST
      ========================= */}

      <div className="notifications-list">

        {notifications.length === 0 ? (

          <div className="no-notifications">

            <div>
              🔔
            </div>

            <h2>
              No notifications
            </h2>

            <p>
              You're all caught up!
            </p>

          </div>

        ) : (

          notifications.map(
            (notification) => (

              <div
                className={`notification-card ${
                  notification.unread
                    ? "unread"
                    : ""
                }`}
                key={notification.id}
                onClick={() =>
                  markAsRead(
                    notification.id
                  )
                }
              >

                {/* ICON */}

                <div className="notification-icon-box">

                  {notification.icon}

                </div>


                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-top">

                    <span className="notification-type">

                      {notification.type}

                    </span>


                    {notification.unread && (

                      <span className="unread-dot">
                      </span>

                    )}

                  </div>


                  <h2>
                    {notification.title}
                  </h2>


                  <p>
                    {notification.message}
                  </p>


                  <span className="notification-time">

                    {notification.time}

                  </span>

                </div>

              </div>

            )
          )

        )}

      </div>

    </div>

  )
}


export default Notifications
