import { useEffect, useState } from "react"

const BACKEND_URL =
  "https://tantra-academy-1.onrender.com"

function History() {
  const [historyItems, setHistoryItems] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  // =====================================================
  // JWT HEADERS
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
  // FORMAT DATE
  // =====================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Recent activity"
    }

    const date =
      dateValue instanceof Date
        ? dateValue
        : new Date(dateValue)

    if (isNaN(date.getTime())) {
      return "Recent activity"
    }

    return (
      date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      ) +
      " · " +
      date.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit"
        }
      )
    )
  }

  // =====================================================
  // GET TIMESTAMP
  // =====================================================

  function getTimestamp(dateValue) {
    if (!dateValue) {
      return 0
    }

    const timestamp =
      new Date(dateValue).getTime()

    return isNaN(timestamp)
      ? 0
      : timestamp
  }

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  async function loadHistory() {
    try {
      setLoading(true)

      const activities = []

      // =================================================
      // CURRENT STUDENT
      // =================================================

      let loggedInUser = null

      try {
        const currentUser =
          sessionStorage.getItem(
            "tantraCurrentUser"
          )

        const loggedUser =
          sessionStorage.getItem(
            "tantraLoggedInUser"
          )

        if (currentUser) {
          loggedInUser =
            JSON.parse(currentUser)
        } else if (loggedUser) {
          loggedInUser =
            JSON.parse(loggedUser)
        }
      } catch (error) {
        console.error(
          "User session error:",
          error
        )
      }

      if (!loggedInUser) {
        setHistoryItems([])
        return
      }

      const studentId =
        loggedInUser.id ||
        loggedInUser._id ||
        loggedInUser.userId

      if (!studentId) {
        setHistoryItems([])
        return
      }

      const authHeaders =
        getAuthHeaders()

      // =================================================
      // SONG PROGRESS
      // =================================================

      try {
        const response =
          await fetch(
            `${BACKEND_URL}/api/song-progress/?studentId=${encodeURIComponent(
              studentId
            )}`,
            {
              method: "GET",
              headers:
                authHeaders,
              cache: "no-store"
            }
          )

        if (response.ok) {
          const data =
            await response.json()

          if (
            data.success &&
            Array.isArray(
              data.progress
            )
          ) {
            data.progress.forEach(
              (progress, index) => {
                if (
                  Number(
                    progress.progress
                  ) >= 100
                ) {
                  const completedDate =
                    progress.completedAt ||
                    progress.updatedAt ||
                    progress.createdAt

                  activities.push({
                    id:
                      `song-${progress.id || index}`,

                    icon: "🎵",

                    title:
                      "Completed song practice",

                    description:
                      progress.songTitle ||
                      progress.title ||
                      progress.songName ||
                      "Song Practice",

                    date:
                      formatDate(
                        completedDate
                      ),

                    timestamp:
                      getTimestamp(
                        completedDate
                      )
                  })
                }
              }
            )
          }
        }
      } catch (error) {
        console.error(
          "Song history error:",
          error
        )
      }

      // =================================================
      // TASK PROGRESS
      // =================================================

      try {
        const response =
          await fetch(
            `${BACKEND_URL}/api/task-progress/?studentId=${encodeURIComponent(
              studentId
            )}`,
            {
              method: "GET",
              headers:
                authHeaders,
              cache: "no-store"
            }
          )

        if (response.ok) {
          const data =
            await response.json()

          if (
            data.success &&
            Array.isArray(
              data.progress
            )
          ) {
            data.progress.forEach(
              (progress, index) => {
                const completed =
                  progress.completed ===
                    true ||
                  String(
                    progress.status ||
                    ""
                  ).toLowerCase() ===
                    "completed" ||
                  Number(
                    progress.progress
                  ) >= 100

                if (completed) {
                  const completedDate =
                    progress.completedAt ||
                    progress.updatedAt ||
                    progress.createdAt

                  activities.push({
                    id:
                      `task-${progress.id || index}`,

                    icon: "✅",

                    title:
                      "Completed task",

                    description:
                      progress.taskTitle ||
                      progress.title ||
                      progress.taskName ||
                      "Practice Task",

                    date:
                      formatDate(
                        completedDate
                      ),

                    timestamp:
                      getTimestamp(
                        completedDate
                      )
                  })
                }
              }
            )
          }
        }
      } catch (error) {
        console.error(
          "Task history error:",
          error
        )
      }

      // =================================================
      // ATTENDANCE
      // =================================================

      try {
        const response =
          await fetch(
            `${BACKEND_URL}/api/attendance/student/${encodeURIComponent(
              studentId
            )}`,
            {
              method: "GET",
              headers:
                authHeaders,
              cache: "no-store"
            }
          )

        if (response.ok) {
          const data =
            await response.json()

          if (
            data.success &&
            Array.isArray(
              data.attendance
            )
          ) {
            data.attendance.forEach(
              (record, index) => {
                if (
                  String(
                    record.status ||
                    ""
                  ).toLowerCase() ===
                  "present"
                ) {
                  const attendanceDate =
                    record.date
                      ? `${record.date}T12:00:00`
                      : null

                  activities.push({
                    id:
                      `attendance-${record.id || index}`,

                    icon: "📅",

                    title:
                      "Attended class",

                    description:
                      record.course ||
                      "Music Class",

                    date:
                      formatDate(
                        attendanceDate
                      ),

                    timestamp:
                      getTimestamp(
                        attendanceDate
                      )
                  })
                }
              }
            )
          }
        }
      } catch (error) {
        console.error(
          "Attendance history error:",
          error
        )
      }

      // =================================================
      // FEES
      // =================================================

      try {
        const response =
          await fetch(
            `${BACKEND_URL}/api/fees/`,
            {
              method: "GET",
              headers:
                authHeaders,
              cache: "no-store"
            }
          )

        if (response.ok) {
          const data =
            await response.json()

          if (
            data.success &&
            Array.isArray(
              data.fees
            )
          ) {
            data.fees
              .filter(
                fee =>
                  String(
                    fee.studentId
                  ) ===
                    String(
                      studentId
                    ) &&
                  String(
                    fee.status ||
                    ""
                  ).toLowerCase() ===
                    "paid"
              )
              .forEach(
                (fee, index) => {
                  const paymentDate =
                    fee.paidDate ||
                    fee.paymentDate ||
                    fee.updatedAt ||
                    fee.createdAt

                  const amount =
                    fee.amount
                      ? ` · ₹${Number(
                          fee.amount
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      : ""

                  activities.push({
                    id:
                      `fee-${fee.id || index}`,

                    icon: "💳",

                    title:
                      "Fee payment completed",

                    description:
                      `${fee.month || "Monthly Fee"}${amount}`,

                    date:
                      formatDate(
                        paymentDate
                      ),

                    timestamp:
                      getTimestamp(
                        paymentDate
                      )
                  })
                }
              )
          }
        }
      } catch (error) {
        console.error(
          "Fee history error:",
          error
        )
      }

      // =================================================
      // EVENTS + BOOKINGS
      // =================================================

      try {
        const eventsResponse =
          await fetch(
            `${BACKEND_URL}/api/events/`,
            {
              method: "GET",
              headers:
                authHeaders,
              cache: "no-store"
            }
          )

        if (eventsResponse.ok) {
          const eventsData =
            await eventsResponse.json()

          if (
            eventsData.success &&
            Array.isArray(
              eventsData.events
            )
          ) {
            for (
              const event
              of eventsData.events
            ) {
              try {
                const bookingResponse =
                  await fetch(
                    `${BACKEND_URL}/api/events/${event.id}/bookings`,
                    {
                      method: "GET",
                      headers:
                        authHeaders,
                      cache: "no-store"
                    }
                  )

                if (
                  !bookingResponse.ok
                ) {
                  continue
                }

                const bookingData =
                  await bookingResponse.json()

                if (
                  bookingData.success &&
                  Array.isArray(
                    bookingData.bookings
                  )
                ) {
                  bookingData.bookings
                    .filter(
                      booking =>
                        String(
                          booking.studentId
                        ) ===
                        String(
                          studentId
                        )
                    )
                    .forEach(
                      (
                        booking,
                        index
                      ) => {
                        const bookingDate =
                          booking.createdAt ||
                          booking.bookingDate

                        activities.push({
                          id:
                            `booking-${booking.id || index}`,

                          icon: "🎫",

                          title:
                            "Event registered",

                          description:
                            event.title ||
                            booking.eventTitle ||
                            "Academy Event",

                          date:
                            formatDate(
                              bookingDate
                            ),

                          timestamp:
                            getTimestamp(
                              bookingDate
                            )
                        })
                      }
                    )
                }
              } catch (
                bookingError
              ) {
                console.error(
                  "Event booking error:",
                  bookingError
                )
              }
            }
          }
        }
      } catch (error) {
        console.error(
          "Event history error:",
          error
        )
      }

      // =================================================
      // FEEDBACK
      // =================================================

      try {
        const response =
          await fetch(
            `${BACKEND_URL}/api/feedback/?studentId=${encodeURIComponent(
              studentId
            )}`,
            {
              method: "GET",
              headers:
                authHeaders,
              cache: "no-store"
            }
          )

        if (response.ok) {
          const data =
            await response.json()

          if (
            data.success &&
            Array.isArray(
              data.feedback
            )
          ) {
            data.feedback.forEach(
              (item, index) => {
                const feedbackDate =
                  item.createdAt ||
                  item.date

                activities.push({
                  id:
                    `feedback-${item.id || index}`,

                  icon: "💬",

                  title:
                    "Feedback submitted",

                  description:
                    `${item.rating || 0}/5 stars · ${
                      item.message ||
                      "Feedback"
                    }`,

                  date:
                    formatDate(
                      feedbackDate
                    ),

                  timestamp:
                    getTimestamp(
                      feedbackDate
                    )
                })
              }
            )
          }
        }
      } catch (error) {
        console.error(
          "Feedback history error:",
          error
        )
      }

      // =================================================
      // SORT NEWEST FIRST
      // =================================================

      activities.sort(
        (a, b) =>
          b.timestamp -
          a.timestamp
      )

      setHistoryItems(
        activities.slice(0, 20)
      )
    } catch (error) {
      console.error(
        "History loading error:",
        error
      )

      setHistoryItems([])
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INITIAL LOAD + EVENTS
  // =====================================================

  useEffect(() => {
    loadHistory()

    const events = [
      "storage",
      "progressUpdated",
      "taskProgressUpdated",
      "attendanceUpdated",
      "feesUpdated",
      "bookingUpdated",
      "feedbackUpdated"
    ]

    events.forEach(
      eventName => {
        window.addEventListener(
          eventName,
          loadHistory
        )
      }
    )

    return () => {
      events.forEach(
        eventName => {
          window.removeEventListener(
            eventName,
            loadHistory
          )
        }
      )
    }
  }, [])

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="history-page"
      style={{
        minHeight: "100dvh",
        height: "auto",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling:
          "touch"
      }}
    >

      {/* HEADER */}

      <div className="history-header">

        <p>
          YOUR ACTIVITY
        </p>

        <h1>
          History 📜
        </h1>

        <span>
          Track your learning journey
          and academy activities.
        </span>

      </div>


      {/* HISTORY CARD */}

      <div className="history-card">

        <div className="history-card-heading">

          <p>
            ACTIVITY TIMELINE
          </p>

          <h2>
            Recent Activity
          </h2>

        </div>


        {/* TIMELINE */}

        <div className="history-timeline">

          {loading ? (

            <div className="history-item">

              <div className="history-icon">
                ⏳
              </div>

              <div className="history-content">

                <h3>
                  Loading history...
                </h3>

                <p>
                  Please wait while your
                  activities are loaded.
                </p>

              </div>

            </div>

          ) : historyItems.length ===
            0 ? (

            <div className="history-item">

              <div className="history-icon">
                📜
              </div>

              <div className="history-content">

                <h3>
                  No activity yet
                </h3>

                <p>
                  Your academy activities
                  will appear here.
                </p>

              </div>

            </div>

          ) : (

            historyItems.map(
              item => (

                <div
                  className="history-item"
                  key={item.id}
                >

                  <div className="history-icon">
                    {item.icon}
                  </div>

                  <div className="history-content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                    <span>
                      {item.date}
                    </span>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  )
}

export default History