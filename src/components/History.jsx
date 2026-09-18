import { useEffect, useState } from "react"

const defaultHistoryItems = [
  {
    id: "default-song",
    icon: "🎵",
    title: "Completed song practice",
    description: "Perfect - Vocal Practice",
    date: "09 Sep 2026 · 6:20 PM",
    timestamp: new Date("2026-09-09T18:20:00").getTime()
  },
  {
    id: "default-task",
    icon: "✅",
    title: "Completed task",
    description: "Practice Vocal Warm-ups",
    date: "08 Sep 2026 · 5:45 PM",
    timestamp: new Date("2026-09-08T17:45:00").getTime()
  },
  {
    id: "default-class",
    icon: "📅",
    title: "Attended class",
    description: "Vocal Training · Music Studio 1",
    date: "08 Sep 2026 · 5:00 PM",
    timestamp: new Date("2026-09-08T17:00:00").getTime()
  },
  {
    id: "default-fee",
    icon: "💳",
    title: "Fee payment completed",
    description: "September 2026 · ₹3,000",
    date: "05 Sep 2026 · 10:30 AM",
    timestamp: new Date("2026-09-05T10:30:00").getTime()
  },
  {
    id: "default-event",
    icon: "🎫",
    title: "Event registered",
    description: "Annual Music Concert",
    date: "02 Sep 2026 · 4:15 PM",
    timestamp: new Date("2026-09-02T16:15:00").getTime()
  }
]


function History() {

  const [historyItems, setHistoryItems] =
    useState(defaultHistoryItems)


  // ==============================
  // DATE FORMAT
  // ==============================

  function formatDate(dateValue) {

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



  // ==============================
  // LOAD HISTORY
  // ==============================

  function loadHistory() {

    const activities = []


    // ==============================
    // SONG PROGRESS
    // ==============================

    const songProgress =
      JSON.parse(
        localStorage.getItem(
          "tantraStudentProgress"
        )
      ) || []


    songProgress.forEach(
      (progress, index) => {

        if (
          Number(progress.progress) >= 100
        ) {

          const songName =
            progress.songTitle ||
            progress.title ||
            "Song Practice"


          activities.push({

            id:
              `song-${progress.id || index}`,

            icon: "🎵",

            title:
              "Completed song practice",

            description:
              songName,

            date:
              formatDate(
                progress.completedAt ||
                progress.updatedAt ||
                progress.date ||
                Date.now()
              ),

            timestamp:
              new Date(
                progress.completedAt ||
                progress.updatedAt ||
                progress.date ||
                Date.now()
              ).getTime()

          })

        }

      }
    )



    // ==============================
    // TASKS
    // ==============================

    const tasks =
      JSON.parse(
        localStorage.getItem(
          "tantraTasks"
        )
      ) || []


    tasks.forEach(
      (task, index) => {

        if (
          task.completed === true ||
          task.status === "Completed"
        ) {

          activities.push({

            id:
              `task-${task.id || index}`,

            icon: "✅",

            title:
              "Completed task",

            description:
              task.title ||
              task.name ||
              "Practice Task",

            date:
              formatDate(
                task.completedAt ||
                task.updatedAt ||
                task.date ||
                Date.now()
              ),

            timestamp:
              new Date(
                task.completedAt ||
                task.updatedAt ||
                task.date ||
                Date.now()
              ).getTime()

          })

        }

      }
    )



    // ==============================
    // ATTENDANCE
    // ==============================

    const attendance =
      JSON.parse(
        localStorage.getItem(
          "tantraAttendance"
        )
      ) || []


    attendance.forEach(
      (record, index) => {

        if (
          record.status === "Present" ||
          record.attendance === "Present"
        ) {

          activities.push({

            id:
              `attendance-${record.id || index}`,

            icon: "📅",

            title:
              "Attended class",

            description:
              `${record.course || "Music Class"}${
                record.location
                  ? ` · ${record.location}`
                  : ""
              }`,

            date:
              formatDate(
                record.date ||
                record.attendanceDate ||
                Date.now()
              ),

            timestamp:
              new Date(
                record.date ||
                record.attendanceDate ||
                Date.now()
              ).getTime()

          })

        }

      }
    )



    // ==============================
    // FEES
    // ==============================

    const fees =
      JSON.parse(
        localStorage.getItem(
          "tantraFees"
        )
      ) || []


    fees.forEach(
      (fee, index) => {

        if (
          fee.status === "Paid"
        ) {

          activities.push({

            id:
              `fee-${fee.id || index}`,

            icon: "💳",

            title:
              "Fee payment completed",

            description:
              `${fee.month || "Monthly Fee"}${
                fee.amount
                  ? ` · ₹${Number(
                      fee.amount
                    ).toLocaleString()}`
                  : ""
              }`,

            date:
              formatDate(
                fee.paidDate ||
                fee.paymentDate ||
                fee.date ||
                Date.now()
              ),

            timestamp:
              new Date(
                fee.paidDate ||
                fee.paymentDate ||
                fee.date ||
                Date.now()
              ).getTime()

          })

        }

      }
    )



    // ==============================
    // EVENT BOOKINGS
    // ==============================

    const bookings =
      JSON.parse(
        localStorage.getItem(
          "tantraEventBookings"
        )
      ) || []


    bookings.forEach(
      (booking, index) => {

        activities.push({

          id:
            `booking-${booking.id || index}`,

          icon: "🎫",

          title:
            "Event registered",

          description:
            booking.eventTitle ||
            "Academy Event",

          date:
            formatDate(
              booking.bookingDate ||
              booking.createdAt ||
              Date.now()
            ),

          timestamp:
            new Date(
              booking.bookingDate ||
              booking.createdAt ||
              Date.now()
            ).getTime()

        })

      }
    )



    // ==============================
    // FEEDBACK
    // ==============================

    const feedback =
      JSON.parse(
        localStorage.getItem(
          "tantraFeedback"
        )
      ) || []


    feedback.forEach(
      (item, index) => {

        activities.push({

          id:
            `feedback-${item.id || index}`,

          icon: "💬",

          title:
            "Feedback submitted",

          description:
            `${item.rating || 0}/5 stars · ${
              item.message || "Feedback"
            }`,

          date:
            item.createdAt
              ? formatDate(item.createdAt)
              : item.date || "Recent activity",

          timestamp:
            item.createdAt
              ? new Date(
                  item.createdAt
                ).getTime()
              : 0

        })

      }
    )



    // ==============================
    // SORT NEWEST FIRST
    // ==============================

    activities.sort(
      (a, b) =>
        b.timestamp - a.timestamp
    )



    // If no real activity exists,
    // show sample activity

    if (
      activities.length === 0
    ) {

      setHistoryItems(
        defaultHistoryItems
      )

      return

    }



    setHistoryItems(
      activities.slice(0, 20)
    )

  }



  // ==============================
  // LIVE UPDATES
  // ==============================

  useEffect(() => {

    loadHistory()


    const events = [
      "storage",
      "progressUpdated",
      "tasksUpdated",
      "attendanceUpdated",
      "feesUpdated",
      "bookingUpdated",
      "feedbackUpdated"
    ]


    events.forEach(
      (eventName) => {

        window.addEventListener(
          eventName,
          loadHistory
        )

      }
    )


    return () => {

      events.forEach(
        (eventName) => {

          window.removeEventListener(
            eventName,
            loadHistory
          )

        }
      )

    }

  }, [])



  return (

    <div className="history-page">


      {/* ==============================
          HEADER
          ============================== */}

      <div className="history-header">

        <div>

          <p>
            YOUR ACTIVITY
          </p>


          <h1>
            History 📜
          </h1>


          <span>
            Track your learning journey and academy activities.
          </span>

        </div>

      </div>



      {/* ==============================
          HISTORY CARD
          ============================== */}

      <div className="history-card">


        <div className="history-card-heading">

          <p>
            ACTIVITY TIMELINE
          </p>


          <h2>
            Recent Activity
          </h2>

        </div>



        {/* ==============================
            TIMELINE
            ============================== */}

        <div className="history-timeline">

          {historyItems.map(
            (item) => (

              <div
                className="history-item"
                key={item.id}
              >


                {/* ICON */}

                <div className="history-icon">

                  {item.icon}

                </div>



                {/* CONTENT */}

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
          )}

        </div>

      </div>

    </div>

  )

}


export default History