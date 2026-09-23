import { useEffect, useState } from "react"

const EVENTS_API =
  "http://127.0.0.1:5000/api/events"

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [selectedTicket, setSelectedTicket] =
    useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  function getAuthHeaders() {
    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})
    }
  }

  // =====================================================
  // GET CURRENT STUDENT
  // =====================================================

  function getCurrentStudent() {
    try {
      const currentUser =
        sessionStorage.getItem(
          "tantraCurrentUser"
        )

      if (currentUser) {
        return JSON.parse(currentUser)
      }

      const loggedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (loggedUser) {
        return JSON.parse(loggedUser)
      }
    } catch (error) {
      console.error(
        "Student session error:",
        error
      )
    }

    return null
  }

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  async function loadBookings() {
    try {
      setLoading(true)
      setError("")

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        )
        setBookings([])
        return
      }

      const student =
        getCurrentStudent()

      if (!student) {
        setError(
          "Student information not found. Please login again."
        )
        setBookings([])
        return
      }

      const studentId =
        student.id ||
        student._id ||
        student.userId

      if (!studentId) {
        setError(
          "Student ID not found."
        )
        setBookings([])
        return
      }

      // =================================================
      // LOAD EVENTS
      // =================================================

      const eventsResponse =
        await fetch(EVENTS_API, {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store"
        })

      const eventsData =
        await eventsResponse.json()

      if (
        !eventsResponse.ok ||
        !eventsData.success
      ) {
        throw new Error(
          eventsData.message ||
            "Unable to load events."
        )
      }

      const eventList =
        Array.isArray(
          eventsData.events
        )
          ? eventsData.events
          : []

      // =================================================
      // LOAD BOOKINGS
      // =================================================

      const allBookings = []

      for (const event of eventList) {
        try {
          const eventId =
            event.id ||
            event._id

          if (!eventId) {
            continue
          }

          const bookingResponse =
            await fetch(
              `${EVENTS_API}/${eventId}/bookings`,
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
            !bookingResponse.ok ||
            !bookingData.success
          ) {
            continue
          }

          const eventBookings =
            Array.isArray(
              bookingData.bookings
            )
              ? bookingData.bookings
              : []

          const studentBookings =
            eventBookings.filter(
              (booking) =>
                String(
                  booking.studentId
                ) ===
                String(studentId)
            )

          studentBookings.forEach(
            (booking) => {
              allBookings.push({
                ...booking,

                eventId,

                eventTitle:
                  event.title,

                date:
                  event.date,

                month:
                  event.month,

                time:
                  event.time,

                location:
                  event.location,

                ticketPrice:
                  event.ticketPrice,

                description:
                  event.description
              })
            }
          )
        } catch (error) {
          console.error(
            "Booking loading error:",
            error
          )
        }
      }

      // =================================================
      // SORT
      // =================================================

      allBookings.sort(
        (a, b) => {
          const dateA =
            parseEventDate(a)

          const dateB =
            parseEventDate(b)

          return dateB - dateA
        }
      )

      setBookings(allBookings)

      // =================================================
      // CLOSE DELETED TICKET
      // =================================================

      setSelectedTicket(
        (currentTicket) => {
          if (!currentTicket) {
            return null
          }

          const stillExists =
            allBookings.some(
              (booking) =>
                String(
                  booking.id
                ) ===
                String(
                  currentTicket.id
                )
            )

          return stillExists
            ? currentTicket
            : null
        }
      )
    } catch (error) {
      console.error(
        "My Tickets loading error:",
        error
      )

      setError(
        error.message ||
          "Unable to load your tickets."
      )

      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // PARSE EVENT DATE
  // =====================================================

  function parseEventDate(event) {
    if (!event) {
      return new Date(0)
    }

    // Backend may already provide YYYY-MM-DD
    if (
      typeof event.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        event.date
      )
    ) {
      return new Date(
        `${event.date}T00:00:00`
      )
    }

    const monthMap = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11
    }

    const monthKey =
      String(
        event.month || ""
      )
        .toUpperCase()
        .slice(0, 3)

    const month =
      monthMap[monthKey]

    const day =
      Number(event.date)

    const year =
      Number(
        event.year ||
          new Date().getFullYear()
      )

    if (
      month === undefined ||
      !day
    ) {
      return new Date(0)
    }

    return new Date(
      year,
      month,
      day
    )
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadBookings()

    function handleBookingUpdated() {
      loadBookings()
    }

    function handleStorage() {
      loadBookings()
    }

    window.addEventListener(
      "bookingUpdated",
      handleBookingUpdated
    )

    window.addEventListener(
      "storage",
      handleStorage
    )

    return () => {
      window.removeEventListener(
        "bookingUpdated",
        handleBookingUpdated
      )

      window.removeEventListener(
        "storage",
        handleStorage
      )
    }
  }, [])

  // =====================================================
  // CLOSE TICKET
  // =====================================================

  function closeTicket() {
    setSelectedTicket(null)
  }

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  function formatAmount(amount) {
    return Number(
      amount || 0
    ).toLocaleString("en-IN")
  }

  // =====================================================
  // FORMAT BOOKING DATE
  // =====================================================

  function formatBookingDate(
    booking
  ) {
    if (
      booking.date &&
      booking.month
    ) {
      return `${booking.date} ${booking.month}`
    }

    return booking.date || "-"
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bookings-page">

      {/* HEADER */}

      <div className="bookings-header">
        <div>
          <p>
            MY EVENTS
          </p>

          <h1>
            My Tickets 🎫
          </h1>

          <span>
            View your upcoming event
            bookings and tickets.
          </span>
        </div>

        <div className="booking-count">
          {bookings.length}{" "}
          {bookings.length === 1
            ? "Booking"
            : "Bookings"}
        </div>
      </div>

      {/* ERROR */}

      {!loading && error && (
        <div className="payment-error">
          {error}

          <button
            type="button"
            onClick={loadBookings}
            style={{
              marginLeft: "12px"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="no-bookings">
          <div>
            ⏳
          </div>

          <h2>
            Loading your tickets...
          </h2>

          <p>
            Please wait while we load
            your bookings.
          </p>
        </div>
      ) : !error &&
        bookings.length === 0 ? (
        <div className="no-bookings">
          <div>
            🎫
          </div>

          <h2>
            No tickets booked yet
          </h2>

          <p>
            Book a ticket from the
            Events page to see it here.
          </p>
        </div>
      ) : !error ? (
        <div className="bookings-grid">

          {bookings.map(
            (booking) => (
              <div
                className="booking-card"
                key={
                  booking.id
                }
              >

                {/* TOP */}

                <div className="booking-card-top">
                  <div className="booking-event-icon">
                    🎵
                  </div>

                  <span className="booking-confirmed">
                    ✓{" "}
                    {booking.status ||
                      "Confirmed"}
                  </span>
                </div>

                {/* EVENT NAME */}

                <h2>
                  {booking.eventTitle ||
                    "Academy Event"}
                </h2>

                {/* DETAILS */}

                <div className="booking-details">

                  <div>
                    <span>
                      📅 Date
                    </span>

                    <strong>
                      {formatBookingDate(
                        booking
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      🕐 Time
                    </span>

                    <strong>
                      {booking.time ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      📍 Location
                    </span>

                    <strong>
                      {booking.location ||
                        "Academy"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      🎟️ Tickets
                    </span>

                    <strong>
                      {booking.tickets ||
                        0}
                    </strong>
                  </div>

                </div>

                {/* BOOKING SUMMARY */}

                <div className="booking-bottom">

                  <div>
                    <span>
                      Booking ID
                    </span>

                    <strong>
                      {booking.id}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {formatAmount(
                        booking.totalAmount
                      )}
                    </strong>
                  </div>

                </div>

                {/* VIEW TICKET */}

                <button
                  type="button"
                  className="view-ticket-btn"
                  onClick={() =>
                    setSelectedTicket(
                      booking
                    )
                  }
                >
                  🎫 View Ticket
                </button>

              </div>
            )
          )}

        </div>
      ) : null}

      {/* DIGITAL TICKET */}

      {selectedTicket && (
        <div
          className="ticket-modal-overlay"
          onClick={closeTicket}
        >

          <div
            className="digital-ticket"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="ticket-close"
              onClick={closeTicket}
            >
              ✕
            </button>

            {/* BRAND */}

            <div className="ticket-brand">
              🎵 TANTRA
            </div>

            <p className="ticket-label">
              EVENT TICKET
            </p>

            <div className="ticket-divider" />

            {/* EVENT */}

            <h2>
              {selectedTicket.eventTitle ||
                "Academy Event"}
            </h2>

            {/* EVENT INFORMATION */}

            <div className="ticket-info">

              <div>
                <span>
                  📅 Date
                </span>

                <strong>
                  {formatBookingDate(
                    selectedTicket
                  )}
                </strong>
              </div>

              <div>
                <span>
                  🕐 Time
                </span>

                <strong>
                  {selectedTicket.time ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>
                  📍 Location
                </span>

                <strong>
                  {selectedTicket.location ||
                    "Academy"}
                </strong>
              </div>

              <div>
                <span>
                  🎟️ Tickets
                </span>

                <strong>
                  {selectedTicket.tickets ||
                    0}
                </strong>
              </div>

            </div>

            {/* BOOKING INFORMATION */}

            <div className="ticket-booking-info">

              <div>
                <span>
                  Booking ID
                </span>

                <strong>
                  {selectedTicket.id}
                </strong>
              </div>

              <div>
                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {formatAmount(
                    selectedTicket.totalAmount
                  )}
                </strong>
              </div>

            </div>

            {/* CONFIRMATION */}

            <div className="ticket-confirmed">
              ✓ BOOKING CONFIRMED
            </div>

            {/* ACTIONS */}

            <div className="ticket-actions">

              <button
                type="button"
                className="ticket-print-btn"
                onClick={() =>
                  window.print()
                }
              >
                🖨️ Print Ticket
              </button>

              <button
                type="button"
                className="ticket-close-btn"
                onClick={closeTicket}
              >
                Close Ticket
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default MyBookings