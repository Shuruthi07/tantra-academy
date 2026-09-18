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

  // =========================
  // EVENTS
  // =========================

  const [events, setEvents] = useState(() => {

    return (
      JSON.parse(
        localStorage.getItem("tantraEvents")
      ) || defaultEvents
    )

  })


  // =========================
  // BOOKINGS
  // =========================

  const [bookings, setBookings] = useState(() => {

    return (
      JSON.parse(
        localStorage.getItem(
          "tantraEventBookings"
        )
      ) || []
    )

  })


  // =========================
  // SELECTED EVENT
  // =========================

  const [selectedEvent, setSelectedEvent] =
    useState(null)


  // =========================
  // TICKET COUNT
  // =========================

  const [ticketCount, setTicketCount] =
    useState(1)


  // =========================
  // LOAD LIVE EVENTS
  // =========================

  useEffect(() => {

    function loadEvents() {

      const savedEvents =
        JSON.parse(
          localStorage.getItem("tantraEvents")
        )

      if (savedEvents) {
        setEvents(savedEvents)
      }

    }


    function loadBookings() {

      const savedBookings =
        JSON.parse(
          localStorage.getItem(
            "tantraEventBookings"
          )
        ) || []

      setBookings(savedBookings)

    }


    window.addEventListener(
      "storage",
      loadEvents
    )

    window.addEventListener(
      "storage",
      loadBookings
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
        "storage",
        loadBookings
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


  // =========================
  // OPEN EVENT
  // =========================

  function openEvent(event) {

    setSelectedEvent(event)

    setTicketCount(1)

  }


  // =========================
  // CLOSE EVENT
  // =========================

  function closeEvent() {

    setSelectedEvent(null)

    setTicketCount(1)

  }


  // =========================
  // BOOK EVENT
  // =========================

  function bookEvent() {

    if (!selectedEvent) {
      return
    }


    if (ticketCount < 1) {

      alert(
        "Please select at least 1 ticket."
      )

      return

    }


    // Check whether this student
    // already has a booking

    const alreadyBooked =
      bookings.some(
        (booking) =>
          String(booking.eventId) ===
          String(selectedEvent.id)
      )


    if (alreadyBooked) {

      alert(
        "You have already booked this event. 🎟️"
      )

      return

    }


    // =========================
    // CREATE BOOKING
    // =========================

    const newBooking = {

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
        Number(ticketCount),

      totalAmount:
        Number(
          selectedEvent.ticketPrice || 0
        ) *
        Number(ticketCount),

      status:
        "Confirmed"

    }


    const updatedBookings = [
      ...bookings,
      newBooking
    ]


    // Save booking

    localStorage.setItem(
      "tantraEventBookings",
      JSON.stringify(
        updatedBookings
      )
    )


    // Update page immediately

    setBookings(
      updatedBookings
    )


    // Tell other components

    window.dispatchEvent(
      new Event("bookingUpdated")
    )


    // =========================
    // TEACHER NOTIFICATION
    // =========================

    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    const newNotification = {

      id: Date.now(),

      icon: "🎫",

      title:
        "New event booking",

      message:
        `A student booked ${ticketCount} ticket${ticketCount > 1 ? "s" : ""} for "${selectedEvent.title}".`,

      type: "Event",

      time:
        "Just now",

      unread:
        true

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


    alert(
      "Event booking confirmed! 🎉"
    )


    closeEvent()

  }


  return (

    <section className="events-section">


      {/* =========================
          HEADER
      ========================= */}

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



      {/* =========================
          EVENTS
      ========================= */}

      <div className="events-container">

        {events.length === 0 ? (

          <div className="no-events-message">

            <div>
              🎫
            </div>

            <h2>
              No upcoming events
            </h2>

            <p>
              New academy events will appear here.
            </p>

          </div>

        ) : (

          events.map((event) => {

            const isBooked =
              bookings.some(
                (booking) =>
                  String(
                    booking.eventId
                  ) ===
                  String(event.id)
              )


            return (

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

                  </div>


                  {/* PRICE */}

                  {event.ticketPrice !== undefined && (

                    <div className="event-ticket-price">

                      🎟️ ₹
                      {Number(
                        event.ticketPrice
                      ).toLocaleString()}

                    </div>

                  )}



                  <button
                    onClick={() =>
                      openEvent(event)
                    }
                  >

                    {isBooked
                      ? "✓ View Booking"
                      : "View Details →"}

                  </button>

                </div>

              </div>

            )

          })

        )}

      </div>



      {/* =========================
          EVENT DETAILS MODAL
      ========================= */}

      {selectedEvent && (

        <div
          className="event-modal-overlay"
          onClick={closeEvent}
        >

          <div
            className="event-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* CLOSE */}

            <button
              className="event-modal-close"
              onClick={closeEvent}
            >
              ✕
            </button>



            {/* DATE */}

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



            {/* DETAILS */}

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
                  ₹
                  {Number(
                    selectedEvent.ticketPrice || 0
                  ).toLocaleString()}
                </strong>

              </div>

            </div>



            {/* =========================
                ALREADY BOOKED
            ========================= */}

            {bookings.some(
              (booking) =>
                String(
                  booking.eventId
                ) ===
                String(
                  selectedEvent.id
                )
            ) ? (

              <div className="event-already-booked">

                <div>
                  ✓
                </div>

                <strong>
                  Event Already Booked
                </strong>

                <p>
                  You have already booked tickets
                  for this event.
                </p>

              </div>

            ) : (

              <>


                {/* TICKET COUNT */}

                <div className="event-ticket-selector">

                  <label>
                    Number of Tickets
                  </label>


                  <div className="ticket-counter">

                    <button
                      type="button"
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
                      type="button"
                      onClick={() =>
                        setTicketCount(
                          ticketCount + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>



                {/* TOTAL */}

                <div className="event-booking-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(
                        selectedEvent.ticketPrice ||
                        0
                      ) *
                      Number(
                        ticketCount
                      )
                    ).toLocaleString()}
                  </strong>

                </div>



                {/* BOOK */}

                <button
                  className="event-register-btn"
                  onClick={bookEvent}
                >
                  🎟️ Book Event
                </button>

              </>

            )}



            {/* CLOSE */}

            <button
              className="event-close-btn"
              onClick={closeEvent}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </section>

  )

}

export default Events