import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


const API_URL =
  "http://127.0.0.1:5000/api/events"


function AdminEvents() {

  const navigate = useNavigate()

  const [events, setEvents] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [deletingId, setDeletingId] =
    useState("")


  // =========================
  // GET EVENT ID
  // =========================

  function getEventId(event) {

    return (
      event?.id ||
      event?._id ||
      ""
    )

  }


  // =========================
  // JWT AUTH HEADERS
  // =========================

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


  // =========================
  // LOAD EVENTS
  // =========================

  async function loadEvents() {

    try {

      setLoading(true)
      setError("")


      const response =
        await fetch(
          `${API_URL}/`,
          {
            method: "GET",

            headers:
              getAuthHeaders(),

            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to load events."
        )

      }


      const eventList =
        Array.isArray(
          data.events
        )
          ? data.events
          : []


      // =========================
      // LOAD BOOKING COUNT
      // =========================

      const eventsWithBookings =
        await Promise.all(

          eventList.map(
            async event => {

              const eventId =
                getEventId(event)


              if (!eventId) {

                return {
                  ...event,
                  bookingCount: 0
                }

              }


              try {

                const bookingResponse =
                  await fetch(
                    `${API_URL}/${eventId}/bookings`,
                    {
                      method: "GET",

                      headers:
                        getAuthHeaders(),

                      cache: "no-store"
                    }
                  )


                const bookingData =
                  await bookingResponse.json()


                if (
                  !bookingResponse.ok
                ) {

                  return {
                    ...event,
                    bookingCount: 0
                  }

                }


                const bookings =
                  Array.isArray(
                    bookingData.bookings
                  )
                    ? bookingData.bookings
                    : []


                const bookingCount =
                  bookings.reduce(
                    (
                      total,
                      booking
                    ) =>
                      total +
                      Number(
                        booking.tickets ||
                        0
                      ),
                    0
                  )


                return {
                  ...event,
                  bookingCount
                }


              } catch (error) {

                console.error(
                  "Booking loading error:",
                  error
                )


                return {
                  ...event,
                  bookingCount: 0
                }

              }

            }
          )

        )


      setEvents(
        eventsWithBookings
      )


    } catch (error) {

      console.error(
        "Admin events error:",
        error
      )


      setError(
        error.message ||
        "Unable to load events."
      )


      setEvents([])


    } finally {

      setLoading(false)

    }

  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {

    loadEvents()

  }, [])


  // =========================
  // DELETE EVENT
  // =========================

  async function handleDelete(
    event
  ) {

    const eventId =
      getEventId(event)


    if (!eventId) {

      alert(
        "Event ID is missing."
      )

      return

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${event.title || "this event"}"?`
      )


    if (!confirmed) {
      return
    }


    try {

      setDeletingId(
        String(eventId)
      )


      const response =
        await fetch(
          `${API_URL}/${eventId}`,
          {
            method: "DELETE",

            headers:
              getAuthHeaders()
          }
        )


      const data =
        await response.json()


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to delete event."
        )

      }


      setEvents(
        previous =>
          previous.filter(
            item =>
              String(
                getEventId(item)
              ) !==
              String(eventId)
          )
      )


      alert(
        "Event deleted successfully."
      )


    } catch (error) {

      console.error(
        "Event delete error:",
        error
      )


      alert(
        error.message ||
        "Unable to delete event."
      )


    } finally {

      setDeletingId("")

    }

  }


  // =========================
  // FORMAT PRICE
  // =========================

  function formatPrice(price) {

    const amount =
      Number(price || 0)


    return `₹${amount.toLocaleString(
      "en-IN"
    )}`

  }


  // =========================
  // STATISTICS
  // =========================

  const totalEvents =
    events.length


  const totalBookings =
    events.reduce(
      (
        total,
        event
      ) =>
        total +
        Number(
          event.bookingCount ||
          0
        ),
      0
    )


  const totalRevenue =
    events.reduce(
      (
        total,
        event
      ) =>
        total +
        (
          Number(
            event.ticketPrice ||
            0
          ) *
          Number(
            event.bookingCount ||
            0
          )
        ),
      0
    )


  // =========================
  // PAGE
  // =========================

  return (

    <div className="admin-dashboard">


      {/* HEADER */}

      <div className="admin-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Event Management 🎫
          </h1>

          <span>
            View and manage Tantra Academy events.
          </span>

        </div>

      </div>


      {/* ACTIONS */}

      <div className="admin-event-actions">

        <button
          className="admin-back-btn"
          onClick={() =>
            navigate(
              "/admin-dashboard"
            )
          }
        >
          ← Dashboard
        </button>


        <button
          className="admin-back-btn"
          onClick={
            loadEvents
          }
          disabled={loading}
        >

          {loading
            ? "⏳ Loading..."
            : "🔄 Refresh"}

        </button>

      </div>


      {/* STATISTICS */}

      <div className="admin-stats">


        {/* TOTAL EVENTS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🎫
          </div>

          <div>

            <p>
              Total Events
            </p>

            <h2>
              {loading
                ? "..."
                : totalEvents}
            </h2>

          </div>

        </div>


        {/* BOOKINGS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>

          <div>

            <p>
              Tickets Booked
            </p>

            <h2>
              {loading
                ? "..."
                : totalBookings}
            </h2>

          </div>

        </div>


        {/* REVENUE */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💰
          </div>

          <div>

            <p>
              Ticket Value
            </p>

            <h2>
              {loading
                ? "..."
                : `₹${totalRevenue.toLocaleString(
                    "en-IN"
                  )}`}
            </h2>

          </div>

        </div>


        {/* ACADEMY */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🎵
          </div>

          <div>

            <p>
              Academy
            </p>

            <h2>
              Active
            </h2>

          </div>

        </div>

      </div>


      {/* EVENT RECORDS */}

      <div className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              EVENT RECORDS
            </p>

            <h2>
              Academy Events
            </h2>

          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="payment-loading">

            <div
              style={{
                fontSize: "28px",
                marginBottom: "10px"
              }}
            >
              ⏳
            </div>

            Loading events...

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="payment-error">

              {error}

              <button
                onClick={
                  loadEvents
                }
                style={{
                  marginLeft:
                    "12px"
                }}
              >
                Retry
              </button>

            </div>

          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          events.length === 0 && (

            <div className="payment-empty">

              <div>
                🎫
              </div>

              <h2>
                No events found
              </h2>

              <p>
                Events created by the academy
                will appear here.
              </p>

            </div>

          )}


        {/* EVENT TABLE */}

        {!loading &&
          !error &&
          events.length > 0 && (

            <div className="admin-events-table-wrapper">

              <table className="admin-events-table">

                <thead>

                  <tr>

                    <th>
                      Event
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Ticket Price
                    </th>

                    <th>
                      Bookings
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {events.map(
                    event => {

                      const eventId =
                        getEventId(event)


                      return (

                        <tr
                          key={
                            eventId ||
                            event.title
                          }
                        >


                          {/* EVENT */}

                          <td>

                            <strong
                              className="admin-event-title"
                            >
                              {event.title ||
                                "Academy Event"}
                            </strong>


                            {event.description && (

                              <small
                                className="admin-event-description"
                              >
                                {event.description}
                              </small>

                            )}

                          </td>


                          {/* DATE */}

                          <td>

                            <span className="admin-event-date">

                              <strong>
                                {event.date ||
                                  "-"}
                              </strong>

                              <small>
                                {event.month ||
                                  ""}
                              </small>

                            </span>

                          </td>


                          {/* TIME */}

                          <td>

                            <span className="admin-event-time">

                              🕐{" "}
                              {event.time ||
                                "-"}

                            </span>

                          </td>


                          {/* LOCATION */}

                          <td>

                            <span className="admin-event-location">

                              📍{" "}
                              {event.location ||
                                "-"}

                            </span>

                          </td>


                          {/* PRICE */}

                          <td>

                            <strong className="admin-event-price">

                              {formatPrice(
                                event.ticketPrice
                              )}

                            </strong>

                          </td>


                          {/* BOOKINGS */}

                          <td>

                            <span className="admin-event-bookings">

                              👥{" "}
                              {event.bookingCount ||
                                0}

                            </span>

                          </td>


                          {/* DELETE */}

                          <td>

                            <button
                              className="admin-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  event
                                )
                              }
                              disabled={
                                deletingId ===
                                String(eventId)
                              }
                            >

                              {deletingId ===
                              String(eventId)
                                ? "⏳ Deleting..."
                                : "🗑️ Delete"}

                            </button>

                          </td>

                        </tr>

                      )

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>

  )

}


export default AdminEvents