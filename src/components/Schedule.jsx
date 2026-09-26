import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/schedule"


function Schedule() {

  const [scheduleItems, setScheduleItems] =
    useState([])

  const [selectedItem, setSelectedItem] =
    useState(null)

  const [loading, setLoading] =
    useState(true)


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
  // LOAD SCHEDULE FROM MONGODB
  // =========================================

  async function loadSchedule() {

    try {

      setLoading(true)

      const response =
        await fetch(
          `${API_URL}/`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        )

      }


      const data =
        await response.json()


      console.log(
        "MongoDB Schedule:",
        data
      )


      if (
        data.success &&
        Array.isArray(data.schedule)
      ) {

        const formattedSchedule =
          data.schedule.map(
            (item) => ({

              ...item,

              type:
                item.type ||
                "Class"

            })
          )


        setScheduleItems(
          formattedSchedule
        )

      } else {

        setScheduleItems([])

      }

    } catch (error) {

      console.error(
        "Student Schedule API Error:",
        error
      )

      setScheduleItems([])

    } finally {

      setLoading(false)

    }

  }


  // =========================================
  // LOAD WHEN PAGE OPENS
  // =========================================

  useEffect(() => {

    loadSchedule()

  }, [])


  return (

    <div className="schedule-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="schedule-header">

        <div>

          <p>
            MY CALENDAR
          </p>

          <h1>
            Schedule 📅
          </h1>

          <span>
            Keep track of your classes,
            practices and events.
          </span>

        </div>


        <div className="schedule-count">

          {scheduleItems.length}
          {" "}
          Scheduled

        </div>

      </div>


      {/* =================================
          SCHEDULE LIST
      ================================= */}

      <div className="schedule-list">

        {loading ? (

          <div className="no-schedule">

            <div>
              ⏳
            </div>

            <h2>
              Loading schedule...
            </h2>

            <p>
              Please wait while your
              schedule is loaded.
            </p>

          </div>

        ) : scheduleItems.length === 0 ? (

          <div className="no-schedule">

            <div>
              📅
            </div>

            <h2>
              No schedules yet
            </h2>

            <p>
              Your teacher has not added
              any upcoming classes.
            </p>

          </div>

        ) : (

          scheduleItems.map(
            (item) => (

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

                    {item.type ||
                      "Class"}

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


                {/* VIEW DETAILS */}

                <button
                  type="button"
                  className="schedule-view"
                  onClick={() =>
                    setSelectedItem(item)
                  }
                >
                  View Details
                </button>

              </div>

            )
          )

        )}

      </div>


      {/* =================================
          DETAILS MODAL
      ================================= */}

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


            {/* CLOSE */}

            <button
              type="button"
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

              {selectedItem.type ||
                "Class"}

            </p>


            <div className="schedule-details">


              {/* DATE */}

              <div>

                <span>
                  📅 Date
                </span>

                <strong>

                  {selectedItem.day}
                  {" "}
                  {selectedItem.month}

                </strong>

              </div>


              {/* TIME */}

              <div>

                <span>
                  🕐 Time
                </span>

                <strong>
                  {selectedItem.time}
                </strong>

              </div>


              {/* LOCATION */}

              <div>

                <span>
                  📍 Location
                </span>

                <strong>
                  {selectedItem.room}
                </strong>

              </div>


              {/* COURSE */}

              {selectedItem.course && (

                <div>

                  <span>
                    🎵 Course
                  </span>

                  <strong>
                    {selectedItem.course}
                  </strong>

                </div>

              )}

            </div>


            <button
              type="button"
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