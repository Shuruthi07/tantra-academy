import { useEffect, useState } from "react"

const defaultScheduleItems = [
  {
    id: 1,
    day: "10",
    month: "SEP",
    time: "5:00 PM",
    title: "Vocal Training",
    type: "Class",
    room: "Music Studio 1"
  },
  {
    id: 2,
    day: "12",
    month: "SEP",
    time: "4:00 PM",
    title: "Piano Practice",
    type: "Practice",
    room: "Studio 2"
  },
  {
    id: 3,
    day: "15",
    month: "SEP",
    time: "6:00 PM",
    title: "Guitar Class",
    type: "Class",
    room: "Music Studio 3"
  },
  {
    id: 4,
    day: "25",
    month: "SEP",
    time: "6:00 PM",
    title: "Annual Music Concert",
    type: "Event",
    room: "Main Auditorium"
  }
]

function Schedule() {

  const [scheduleItems, setScheduleItems] = useState(
    defaultScheduleItems
  )

  const [selectedItem, setSelectedItem] =
    useState(null)

  // Load teacher schedule
  useEffect(() => {

    function loadSchedule() {

      const savedSchedule = JSON.parse(
        localStorage.getItem("tantraSchedule") || "[]"
      )

      if (savedSchedule.length > 0) {

        const formattedSchedule = savedSchedule.map(
          (item) => ({
            ...item,

            // Teacher-created classes are Classes
            type: item.type || "Class"
          })
        )

        setScheduleItems(formattedSchedule)

      } else {

        setScheduleItems(defaultScheduleItems)

      }
    }

    loadSchedule()

    // Listen for teacher schedule updates
    window.addEventListener(
      "scheduleUpdated",
      loadSchedule
    )

    // Listen for changes from another browser tab
    window.addEventListener(
      "storage",
      loadSchedule
    )

    return () => {

      window.removeEventListener(
        "scheduleUpdated",
        loadSchedule
      )

      window.removeEventListener(
        "storage",
        loadSchedule
      )
    }

  }, [])


  return (
    <div className="schedule-page">

      {/* HEADER */}

      <div className="schedule-header">

        <div>

          <p>MY CALENDAR</p>

          <h1>
            Schedule 📅
          </h1>

          <span>
            Keep track of your classes,
            practices and events.
          </span>

        </div>

        <div className="schedule-count">
          {scheduleItems.length} Scheduled
        </div>

      </div>


      {/* SCHEDULE LIST */}

      <div className="schedule-list">

        {scheduleItems.length === 0 ? (

          <div className="no-schedule">

            <div>📅</div>

            <h2>
              No schedules yet
            </h2>

            <p>
              Your teacher has not added
              any upcoming classes.
            </p>

          </div>

        ) : (

          scheduleItems.map((item) => (

            <div
              className="schedule-card"
              key={item.id}
            >

              {/* DATE */}

              <div className="schedule-date">

                <strong>
                  {item.day}
                </strong>

                <span>
                  {item.month}
                </span>

              </div>


              {/* INFO */}

              <div className="schedule-info">

                <span className="schedule-type">
                  {item.type || "Class"}
                </span>

                <h2>
                  {item.title}
                </h2>

                <p>
                  🕐 {item.time}
                  &nbsp;&nbsp;
                  📍 {item.room}
                </p>

              </div>


              {/* VIEW */}

              <button
                className="schedule-view"
                onClick={() =>
                  setSelectedItem(item)
                }
              >
                View Details
              </button>

            </div>

          ))

        )}

      </div>


      {/* DETAILS MODAL */}

      {selectedItem && (

        <div
          className="schedule-modal-overlay"
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <div
            className="schedule-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="schedule-modal-close"
              onClick={() =>
                setSelectedItem(null)
              }
            >
              ✕
            </button>


            <div className="schedule-detail-icon">
              📅
            </div>


            <h2>
              {selectedItem.title}
            </h2>

            <p className="schedule-detail-type">
              {selectedItem.type || "Class"}
            </p>


            <div className="schedule-details">

              <div>

                <span>
                  📅 Date
                </span>

                <strong>
                  {selectedItem.day}{" "}
                  {selectedItem.month}
                </strong>

              </div>


              <div>

                <span>
                  🕐 Time
                </span>

                <strong>
                  {selectedItem.time}
                </strong>

              </div>


              <div>

                <span>
                  📍 Location
                </span>

                <strong>
                  {selectedItem.room}
                </strong>

              </div>

            </div>


            <button
              className="close-details-btn"
              onClick={() =>
                setSelectedItem(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default Schedule