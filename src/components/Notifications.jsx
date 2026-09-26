import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/notifications"

function Notifications() {
  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  // =====================================================
  // JWT AUTH HEADERS
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
              `Bearer ${token}`
          }
        : {})
    }
  }

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  function getLoggedInUser() {
    try {
      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (!storedUser) {
        return null
      }

      return JSON.parse(
        storedUser
      )
    } catch (error) {
      console.error(
        "User session error:",
        error
      )

      return null
    }
  }

  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  function getNotificationIcon(
    notification
  ) {
    const type =
      String(
        notification.type || ""
      ).toLowerCase()

    if (type === "music") {
      return "🎵"
    }

    if (type === "class") {
      return "📅"
    }

    if (type === "task") {
      return "✅"
    }

    if (
      type === "payment" ||
      type === "fee"
    ) {
      return "💳"
    }

    if (type === "event") {
      return "🎫"
    }

    if (type === "announcement") {
      return "📢"
    }

    if (type === "feedback") {
      return "💬"
    }

    if (type === "booking") {
      return "🎟️"
    }

    return "🔔"
  }

  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatTime(createdAt) {
    if (!createdAt) {
      return "Recently"
    }

    const date =
      new Date(createdAt)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Recently"
    }

    const now =
      new Date()

    const difference =
      now.getTime() -
      date.getTime()

    if (difference < 0) {
      return "Just now"
    }

    const minutes =
      Math.floor(
        difference /
          (1000 * 60)
      )

    if (minutes < 1) {
      return "Just now"
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1
          ? ""
          : "s"
      } ago`
    }

    const hours =
      Math.floor(
        minutes / 60
      )

    if (hours < 24) {
      return `${hours} hour${
        hours === 1
          ? ""
          : "s"
      } ago`
    }

    const days =
      Math.floor(
        hours / 24
      )

    if (days < 7) {
      return `${days} day${
        days === 1
          ? ""
          : "s"
      } ago`
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    )
  }

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  async function loadNotifications() {
    try {
      setLoading(true)
      setError("")

      const user =
        getLoggedInUser()

      if (!user) {
        setNotifications([])

        setError(
          "Please login to view notifications."
        )

        return
      }

      const userId =
        String(
          user.id ||
          user._id ||
          user.userId ||
          ""
        ).trim()

      if (!userId) {
        setNotifications([])

        setError(
          "User ID is missing from your session."
        )

        return
      }

      const requestUrl =
        `${API_URL}?userId=${encodeURIComponent(
          userId
        )}&_=${Date.now()}`

      const response =
        await fetch(
          requestUrl,
          {
            method: "GET",
            cache: "no-store",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Server returned ${response.status}`
        )
      }

      if (
        data.success !== true
      ) {
        throw new Error(
          data.message ||
            "Unable to load notifications."
        )
      }

      if (
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
        "Notification loading error:",
        error
      )

      setNotifications([])

      setError(
        error.message ||
          "Unable to load notifications from the database."
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

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
      "storage",
      handleNotificationsUpdated
    )

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdated
      )

      window.removeEventListener(
        "storage",
        handleNotificationsUpdated
      )
    }
  }, [])

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      notification =>
        !notification.read
    ).length

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  async function markAsRead(id) {
    const selectedNotification =
      notifications.find(
        notification =>
          String(
            notification.id
          ) === String(id)
      )

    if (!selectedNotification) {
      return
    }

    if (
      selectedNotification.read
    ) {
      return
    }

    // Optimistic update

    setNotifications(
      currentNotifications =>
        currentNotifications.map(
          notification =>
            String(
              notification.id
            ) === String(id)
              ? {
                  ...notification,
                  read: true
                }
              : notification
        )
    )

    try {
      const response =
        await fetch(
          `${API_URL}/${id}/read`,
          {
            method: "PUT",
            headers:
              getAuthHeaders()
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
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      )

      await loadNotifications()
    }
  }

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  async function markAllAsRead() {
    const user =
      getLoggedInUser()

    const userId =
      String(
        user?.id ||
        user?._id ||
        user?.userId ||
        ""
      ).trim()

    if (!userId) {
      return
    }

    setNotifications(
      currentNotifications =>
        currentNotifications.map(
          notification => ({
            ...notification,
            read: true
          })
        )
    )

    try {
      const response =
        await fetch(
          `${API_URL}/read-all?userId=${encodeURIComponent(
            userId
          )}`,
          {
            method: "PUT",
            headers:
              getAuthHeaders()
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
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      )

      await loadNotifications()
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="notifications-page">

        <div className="notifications-header">

          <div>
            <p>
              STAY UPDATED
            </p>

            <h1>
              Notifications 🔔
            </h1>

            <span>
              Loading your notifications...
            </span>
          </div>

        </div>

        <div className="no-notifications">

          <div>
            🔔
          </div>

          <h2>
            Loading notifications...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>
    )
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="notifications-page">

      {/* HEADER */}

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

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >

          <button
            type="button"
            className="secondary-button"
            onClick={
              loadNotifications
            }
          >
            🔄 Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-read-btn"
              onClick={
                markAllAsRead
              }
            >
              ✓ Mark all as read
            </button>
          )}

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="login-error">

          {error}

          <button
            type="button"
            onClick={
              loadNotifications
            }
            style={{
              marginLeft: "12px"
            }}
          >
            🔄 Retry
          </button>

        </div>
      )}

      {/* SUMMARY */}

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

      {/* NOTIFICATION LIST */}

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
            notification => (

              <div
                key={
                  notification.id
                }
                className={
                  `notification-card ${
                    !notification.read
                      ? "unread"
                      : ""
                  }`
                }
                onClick={() =>
                  markAsRead(
                    notification.id
                  )
                }
              >

                {/* ICON */}

                <div className="notification-icon-box">

                  {getNotificationIcon(
                    notification
                  )}

                </div>

                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-top">

                    <span className="notification-type">

                      {notification.type ||
                        "General"}

                    </span>

                    {!notification.read && (
                      <span className="unread-dot" />
                    )}

                  </div>

                  <h2>
                    {notification.title ||
                      "Notification"}
                  </h2>

                  <p>
                    {notification.message ||
                      ""}
                  </p>

                  <span className="notification-time">

                    {formatTime(
                      notification.createdAt
                    )}

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