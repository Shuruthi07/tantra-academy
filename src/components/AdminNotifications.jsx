import { useEffect, useMemo, useState } from "react"

const API_URL =
  "http://127.0.0.1:5000/api/notifications"

function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const getToken = () => {
    return sessionStorage.getItem(
      "tantraAuthToken"
    )
  }

  const getCurrentAdmin = () => {
    try {
      const savedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (!savedUser) {
        return null
      }

      return JSON.parse(savedUser)

    } catch (error) {
      console.error(
        "Admin user read error:",
        error
      )

      return null
    }
  }

  const getAdminId = () => {
    const admin = getCurrentAdmin()

    if (!admin) {
      return ""
    }

    return String(
      admin.id ||
      admin._id ||
      admin.userId ||
      ""
    ).trim()
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError("")

      const token = getToken()
      const adminId = getAdminId()

      if (!token) {
        setError(
          "Admin authentication required."
        )
        return
      }

      if (!adminId) {
        setError(
          "Admin ID not found. Please logout and login again."
        )
        return
      }

      console.log(
        "Loading admin notifications for:",
        adminId
      )

      const response = await fetch(
        `${API_URL}/?userId=${encodeURIComponent(
          adminId
        )}&_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json"
          },
          cache: "no-store"
        }
      )

      const data =
        await response.json()

      console.log(
        "Admin notifications response:",
        data
      )

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.msg ||
          "Failed to load notifications."
        )
      }

      const list =
        Array.isArray(
          data.notifications
        )
          ? data.notifications
          : []

      setNotifications(list)

    } catch (err) {
      console.error(
        "Admin notifications error:",
        err
      )

      setError(
        err.message ||
        "Unable to load notifications."
      )

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    loadNotifications()

    const handleUpdate = () => {
      loadNotifications()
    }

    window.addEventListener(
      "notificationsUpdated",
      handleUpdate
    )

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        handleUpdate
      )
    }

  }, [])


  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (
    notificationId
  ) => {

    try {

      const token = getToken()

      if (!token) {
        return
      }

      const response =
        await fetch(
          `${API_URL}/${notificationId}/read`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            }
          }
        )

      if (!response.ok) {
        return
      }

      setNotifications(
        previous =>
          previous.map(
            notification =>
              String(
                notification.id
              ) ===
              String(
                notificationId
              )
                ? {
                    ...notification,
                    read: true
                  }
                : notification
          )
      )

    } catch (error) {

      console.error(
        "Mark notification error:",
        error
      )

    }
  }


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    try {

      const token = getToken()
      const adminId = getAdminId()

      if (!token || !adminId) {
        return
      }

      const response =
        await fetch(
          `${API_URL}/read-all?userId=${encodeURIComponent(
            adminId
          )}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            }
          }
        )

      if (!response.ok) {
        return
      }

      setNotifications(
        previous =>
          previous.map(
            notification => ({
              ...notification,
              read: true
            })
          )
      )

    } catch (error) {

      console.error(
        "Mark all error:",
        error
      )

    }
  }


  // =====================================================
  // ICON
  // =====================================================

  const getIcon = (type) => {

    const value =
      String(
        type || ""
      ).toLowerCase()

    if (
      value.includes("song") ||
      value.includes("music")
    ) {
      return "🎵"
    }

    if (
      value.includes("task")
    ) {
      return "✅"
    }

    if (
      value.includes("payment") ||
      value.includes("fee")
    ) {
      return "💳"
    }

    if (
      value.includes("event") ||
      value.includes("booking")
    ) {
      return "🎫"
    }

    if (
      value.includes("schedule") ||
      value.includes("class")
    ) {
      return "📅"
    }

    if (
      value.includes("feedback")
    ) {
      return "💬"
    }

    if (
      value.includes("attendance")
    ) {
      return "📊"
    }

    if (
      value.includes("student")
    ) {
      return "👨‍🎓"
    }

    if (
      value.includes("teacher")
    ) {
      return "👨‍🏫"
    }

    if (
      value.includes("gallery")
    ) {
      return "🖼️"
    }

    return "🔔"
  }


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (value) => {

    if (!value) {
      return "Unknown date"
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown date"
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


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredNotifications =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return notifications
      }

      return notifications.filter(
        notification => {

          const title =
            String(
              notification.title ||
              ""
            ).toLowerCase()

          const message =
            String(
              notification.message ||
              ""
            ).toLowerCase()

          const type =
            String(
              notification.type ||
              ""
            ).toLowerCase()

          return (
            title.includes(query) ||
            message.includes(query) ||
            type.includes(query)
          )
        }
      )

    }, [
      notifications,
      search
    ])


  const unreadCount =
    notifications.filter(
      notification =>
        !notification.read
    ).length


  return (
    <div className="admin-notifications-page">

      {/* HEADER */}

      <div className="admin-notifications-header">

        <div>

          <h1>
            🔔 Admin Notifications
          </h1>

          <p>
            View important academy
            activities and updates.
          </p>

        </div>


        <div className="admin-notification-actions">

          <span className="unread-badge">
            {unreadCount} Unread
          </span>


          {unreadCount > 0 && (

            <button
              className="mark-all-btn"
              onClick={
                markAllAsRead
              }
            >
              ✓ Mark All as Read
            </button>

          )}


          <button
            className="refresh-btn"
            onClick={
              loadNotifications
            }
          >
            ↻ Refresh
          </button>

        </div>

      </div>


      {/* SEARCH */}

      <div className="admin-notification-search">

        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={
            event =>
              setSearch(
                event.target.value
              )
          }
        />

      </div>


      {/* ERROR */}

      {error && (

        <div className="notification-error">
          {error}
        </div>

      )}


      {/* LOADING */}

      {loading ? (

        <div className="notification-loading">

          <div className="notification-loading-icon">
            🔔
          </div>

          <p>
            Loading notifications...
          </p>

        </div>

      ) : filteredNotifications.length === 0 ? (

        <div className="notification-empty">

          <div className="empty-icon">
            🔔
          </div>

          <h2>
            No Notifications
          </h2>

          <p>
            {search
              ? "No notifications match your search."
              : "There are no admin notifications available yet."}
          </p>

        </div>

      ) : (

        <div className="notifications-list">

          {filteredNotifications.map(
            notification => (

              <div
                key={
                  notification.id
                }
                className={
                  `admin-notification-card ${
                    notification.read
                      ? "read"
                      : "unread"
                  }`
                }
                onClick={() => {

                  if (
                    !notification.read
                  ) {

                    markAsRead(
                      notification.id
                    )

                  }

                }}
              >

                <div className="notification-icon">

                  {getIcon(
                    notification.type
                  )}

                </div>


                <div className="notification-content">

                  <div className="notification-title-row">

                    <h3>
                      {
                        notification.title ||
                        "Notification"
                      }
                    </h3>


                    {!notification.read && (

                      <span className="new-badge">
                        NEW
                      </span>

                    )}

                  </div>


                  <p>
                    {
                      notification.message ||
                      "No message available."
                    }
                  </p>


                  <div className="notification-meta">

                    <span>
                      🕒{" "}
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                    {notification.type && (

                      <span>
                        Type:{" "}
                        {
                          notification.type
                        }
                      </span>

                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  )
}

export default AdminNotifications