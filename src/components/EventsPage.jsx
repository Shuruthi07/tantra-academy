import { useEffect, useState } from "react"

const defaultEvents = [
  {
    id: 1,
    date: "25",
    month: "SEP",
    title: "Annual Music Concert",
    description:
      "Experience an evening of amazing performances by our talented students.",
    time: "6:00 PM",
    location: "Tantra Academy Auditorium",
    ticketPrice: 500
  },
  {
    id: 2,
    date: "12",
    month: "OCT",
    title: "Music Workshop",
    description:
      "Learn practical techniques from experienced musicians and teachers.",
    time: "10:00 AM",
    location: "Music Studio 1",
    ticketPrice: 300
  },
  {
    id: 3,
    date: "08",
    month: "NOV",
    title: "Student Talent Competition",
    description:
      "A special stage for our students to showcase their musical talent.",
    time: "4:00 PM",
    location: "Main Auditorium",
    ticketPrice: 200
  }
]

function Events() {

  /* =========================
     EVENTS
  ========================= */

  const [events, setEvents] = useState(() => {

    const savedEvents =
      JSON.parse(
        localStorage.getItem("tantraEvents")
      )

    return savedEvents &&
      savedEvents.length > 0
      ? savedEvents
      : defaultEvents
  })


  /* =========================
     BOOKINGS
  ========================= */

  const [bookings, setBookings] = useState(() => {

    return (
      JSON.parse(
        localStorage.getItem(
          "tantraEventBookings"
        )
      ) || []
    )

  })


  const [selectedEvent, setSelectedEvent] =
    useState(null)

  const [showBooking, setShowBooking] =
    useState(false)

  const [ticketCount, setTicketCount] =
    useState(1)


  /* =========================
     LOAD LATEST EVENTS
  ========================= */

  function loadEvents() {

    const savedEvents =
      JSON.parse(
        localStorage.getItem("tantraEvents")
      )

    if (
      savedEvents &&
      savedEvents.length > 0
    ) {

      setEvents(savedEvents)

    } else {

      setEvents(defaultEvents)

    }

  }


  /* =========================
     LOAD BOOKINGS
  ========================= */

  function loadBookings() {

    const savedBookings =
      JSON.parse(
        localStorage.getItem(
          "tantraEventBookings"
        )
      ) || []

    setBookings(savedBookings)

  }


  /* =========================
     EVENT LISTENERS
  ========================= */

  useEffect(() => {

    window.addEventListener(
      "storage",
      loadEvents
    )

    window.addEventListener(
      "eventsUpdated",
      loadEvents
    )

    window.addEventListener(
      "bookingUpdated",
      loadBookings
    )

    return () => {

      window.removeEventListener(
        "storage",
        loadEvents
      )

      window.removeEventListener(
        "eventsUpdated",
        loadEvents
      )

      window.removeEventListener(
        "bookingUpdated",
        loadBookings
      )

    }

  }, [])


  /* =========================
     OPEN BOOKING
  ========================= */

  function openBooking(event) {

    setSelectedEvent(event)

    setTicketCount(1)

    setShowBooking(true)

  }


  /* =========================
     CONFIRM BOOKING
  ========================= */

  function confirmBooking() {

    if (!selectedEvent) {
      return
    }


    const booking = {

      id:
        `TAN-${Math.floor(
          10000 +
          Math.random() * 90000
        )}`,

      eventId:
        selectedEvent.id,

      eventTitle:
        selectedEvent.title,

      date:
        selectedEvent.date,

      month:
        selectedEvent.month,

      time:
        selectedEvent.time,

      location:
        selectedEvent.location,

      tickets:
        ticketCount,

      totalAmount:
        selectedEvent.ticketPrice *
        ticketCount,

      status:
        "Confirmed"

    }


    const updatedBookings = [

      ...bookings,

      booking

    ]


    setBookings(updatedBookings)


    localStorage.setItem(
      "tantraEventBookings",
      JSON.stringify(
        updatedBookings
      )
    )


    window.dispatchEvent(
      new Event("bookingUpdated")
    )


    /* =========================
       TEACHER NOTIFICATION
    ========================= */

    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    const newNotification = {

      id: Date.now(),

      icon: "🎫",

      title: "New event booking",

      message:
        `A student booked ${ticketCount} ticket${ticketCount > 1 ? "s" : ""} for "${selectedEvent.title}".`,

      type: "Event",

      time: "Just now",

      unread: true

    }


    localStorage.setItem(

      "tantraTeacherNotifications",

      JSON.stringify([
        newNotification,
        ...teacherNotifications
      ])

    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
    )


    setShowBooking(false)

    setSelectedEvent(null)


    alert(
      `Booking confirmed! 🎉\nBooking ID: ${booking.id}`
    )

  }


  return (

    <section className="events-section">


      {/* HEADER */}

      <div className="section-heading">

        <p>
          WHAT'S HAPPENING
        </p>

        <h2>
          Upcoming Events
        </h2>

        <span>
          Join our concerts, workshops and special
          musical events.
        </span>

      </div>


      {/* EVENTS */}

      <div className="events-container">

        {events.length === 0 ? (

          <div className="no-events">

            <div>
              🎫
            </div>

            <h2>
              No upcoming events
            </h2>

            <p>
              Your teacher has not added
              any upcoming events.
            </p>

          </div>

        ) : (

          events.map((event) => (

            <div
              className="event-card"
              key={event.id}
            >

              {/* DATE */}

              <div className="event-date">

                <strong>
                  {event.date}
                </strong>

                <span>
                  {event.month}
                </span>

              </div>


              {/* INFO */}

              <div className="event-info">

                <h3>
                  {event.title}
                </h3>


                <p>
                  {event.description}
                </p>


                <div className="event-details">

                  <span>
                    🕐 {event.time}
                  </span>

                  <span>
                    📍 {event.location}
                  </span>

                  <span>
                    🎟️ ₹{event.ticketPrice} / ticket
                  </span>

                </div>


                <button
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                >
                  View Details →
                </button>

              </div>

            </div>

          ))

        )}

      </div>


      {/* =========================
          EVENT DETAILS MODAL
      ========================= */}

      {selectedEvent &&
        !showBooking && (

        <div
          className="event-modal-overlay"
          onClick={() =>
            setSelectedEvent(null)
          }
        >

          <div
            className="event-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="event-modal-close"
              onClick={() =>
                setSelectedEvent(null)
              }
            >
              ✕
            </button>


            <div className="event-modal-date">

              <strong>
                {selectedEvent.date}
              </strong>

              <span>
                {selectedEvent.month}
              </span>

            </div>


            <p className="event-modal-label">
              UPCOMING EVENT
            </p>


            <h2>
              {selectedEvent.title}
            </h2>


            <p className="event-modal-description">
              {selectedEvent.description}
            </p>


            <div className="event-modal-details">

              <div>

                <span>
                  🕐 Time
                </span>

                <strong>
                  {selectedEvent.time}
                </strong>

              </div>


              <div>

                <span>
                  📍 Location
                </span>

                <strong>
                  {selectedEvent.location}
                </strong>

              </div>


              <div>

                <span>
                  🎟️ Ticket Price
                </span>

                <strong>
                  ₹{selectedEvent.ticketPrice}
                </strong>

              </div>

            </div>


            <button
              className="event-register-btn"
              onClick={() =>
                openBooking(selectedEvent)
              }
            >
              🎟️ Book Ticket
            </button>


            <button
              className="event-close-btn"
              onClick={() =>
                setSelectedEvent(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* =========================
          BOOKING MODAL
      ========================= */}

      {selectedEvent &&
        showBooking && (

        <div
          className="event-modal-overlay"
          onClick={() =>
            setShowBooking(false)
          }
        >

          <div
            className="event-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="event-modal-close"
              onClick={() =>
                setShowBooking(false)
              }
            >
              ✕
            </button>


            <p className="event-modal-label">
              BOOK YOUR TICKET
            </p>


            <h2>
              {selectedEvent.title}
            </h2>


            <p className="event-modal-description">

              {selectedEvent.date}{" "}
              {selectedEvent.month}

              {" · "}

              {selectedEvent.time}

            </p>


            {/* TICKET QUANTITY */}

            <div className="ticket-booking-box">

              <div>

                <span>
                  Ticket Price
                </span>

                <strong>
                  ₹{selectedEvent.ticketPrice}
                </strong>

              </div>


              <div className="ticket-quantity">

                <span>
                  Number of Tickets
                </span>


                <div className="quantity-controls">

                  <button
                    onClick={() =>
                      setTicketCount(
                        Math.max(
                          1,
                          ticketCount - 1
                        )
                      )
                    }
                  >
                    −
                  </button>


                  <strong>
                    {ticketCount}
                  </strong>


                  <button
                    onClick={() =>
                      setTicketCount(
                        Math.min(
                          10,
                          ticketCount + 1
                        )
                      )
                    }
                  >
                    +
                  </button>

                </div>

              </div>


              {/* TOTAL */}

              <div className="ticket-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {
                    selectedEvent.ticketPrice *
                    ticketCount
                  }
                </strong>

              </div>

            </div>


            {/* CONFIRM */}

            <button
              className="event-register-btn"
              onClick={confirmBooking}
            >
              🎟️ Confirm Booking
            </button>


            <button
              className="event-close-btn"
              onClick={() =>
                setShowBooking(false)
              }
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </section>

  )
}

export default Events