import { useEffect, useState } from "react"

function TeacherEvents() {

  // =========================
  // DEFAULT EVENTS
  // =========================

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
    }
  ]


  // =========================
  // EVENTS STATE
  // =========================

  const [events, setEvents] = useState(() =>
    JSON.parse(
      localStorage.getItem("tantraEvents")
    ) || defaultEvents
  )


  // =========================
  // BOOKINGS STATE
  // =========================

  const [bookings, setBookings] = useState(() =>
    JSON.parse(
      localStorage.getItem("tantraEventBookings")
    ) || []
  )


  // =========================
  // LOAD LIVE DATA
  // =========================

  useEffect(() => {

    function loadEvents() {

      const savedEvents =
        JSON.parse(
          localStorage.getItem("tantraEvents")
        )

      setEvents(
        savedEvents || defaultEvents
      )

    }


    function loadBookings() {

      const savedBookings =
        JSON.parse(
          localStorage.getItem("tantraEventBookings")
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
  // SELECTED EVENT
  // =========================

  const [selectedEvent, setSelectedEvent] =
    useState(null)


  // =========================
  // FORM
  // =========================

  const [showForm, setShowForm] =
    useState(false)


  const [editingEvent, setEditingEvent] =
    useState(null)


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    ticketPrice: ""
  })


  // =========================
  // EVENT BOOKINGS
  // =========================

  function getEventBookings(eventId) {

    return bookings.filter(
      (booking) =>
        String(booking.eventId) ===
        String(eventId)
    )

  }


  // =========================
  // TOTAL TICKETS
  // =========================

  function getTotalTickets(eventId) {

    return getEventBookings(eventId)
      .reduce(
        (total, booking) =>
          total +
          Number(
            booking.tickets || 0
          ),
        0
      )

  }


  // =========================
  // TOTAL AMOUNT
  // =========================

  function getTotalAmount(eventId) {

    return getEventBookings(eventId)
      .reduce(
        (total, booking) =>
          total +
          Number(
            booking.totalAmount || 0
          ),
        0
      )

  }


  // =========================
  // OPEN ADD FORM
  // =========================

  function openAddForm() {

    setEditingEvent(null)

    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      ticketPrice: ""
    })

    setShowForm(true)

  }


  // =========================
  // OPEN EDIT FORM
  // =========================

  function openEditForm(event) {

    setEditingEvent(event)


    const monthMap = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12"
    }


    const month =
      monthMap[event.month]


    const formattedDate =
      month
        ? `2026-${month}-${String(
            event.date
          ).padStart(2, "0")}`
        : ""


    // Convert 6:00 PM → 18:00
    let formattedTime = ""


    if (event.time) {

      const timeParts =
        event.time.match(
          /(\d+):(\d+)\s*(AM|PM)/i
        )


      if (timeParts) {

        let hours =
          Number(timeParts[1])

        const minutes =
          timeParts[2]

        const period =
          timeParts[3].toUpperCase()


        if (
          period === "PM" &&
          hours !== 12
        ) {
          hours += 12
        }


        if (
          period === "AM" &&
          hours === 12
        ) {
          hours = 0
        }


        formattedTime =
          `${String(hours).padStart(2, "0")}:${minutes}`

      }

    }


    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: formattedDate,
      time: formattedTime,
      location: event.location || "",
      ticketPrice:
        event.ticketPrice ?? ""
    })


    setShowForm(true)

  }


  // =========================
  // SAVE EVENT
  // =========================

  function saveEvent() {

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.date ||
      !formData.time ||
      !formData.location.trim() ||
      formData.ticketPrice === ""
    ) {

      alert(
        "Please fill all fields."
      )

      return

    }


    const dateObject =
      new Date(
        `${formData.date}T00:00:00`
      )


    const formattedDate =
      dateObject
        .getDate()
        .toString()
        .padStart(2, "0")


    const formattedMonth =
      dateObject
        .toLocaleString(
          "en-US",
          {
            month: "short"
          }
        )
        .toUpperCase()


    const formattedTime =
      new Date(
        `1970-01-01T${formData.time}`
      ).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit"
        }
      )


    // =========================
    // EDIT EVENT
    // =========================

    if (editingEvent) {

      const updatedEvents =
        events.map((event) => {

          if (
            event.id ===
            editingEvent.id
          ) {

            return {
              ...event,

              date: formattedDate,

              month: formattedMonth,

              title:
                formData.title.trim(),

              description:
                formData.description.trim(),

              time: formattedTime,

              location:
                formData.location.trim(),

              ticketPrice:
                Number(
                  formData.ticketPrice
                )
            }

          }

          return event

        })


      setEvents(updatedEvents)


      localStorage.setItem(
        "tantraEvents",
        JSON.stringify(
          updatedEvents
        )
      )


      window.dispatchEvent(
        new Event("eventsUpdated")
      )


      alert(
        "Event updated successfully! ✨"
      )

    }

    // =========================
    // CREATE EVENT
    // =========================

    else {

      const newEvent = {

        id: Date.now(),

        date: formattedDate,

        month: formattedMonth,

        title:
          formData.title.trim(),

        description:
          formData.description.trim(),

        time: formattedTime,

        location:
          formData.location.trim(),

        ticketPrice:
          Number(
            formData.ticketPrice
          )

      }


      const updatedEvents = [
        ...events,
        newEvent
      ]


      setEvents(updatedEvents)


      localStorage.setItem(
        "tantraEvents",
        JSON.stringify(
          updatedEvents
        )
      )


      window.dispatchEvent(
        new Event("eventsUpdated")
      )


      alert(
        "Event created successfully! 🎉"
      )

    }


    setShowForm(false)

    setEditingEvent(null)

  }


  // =========================
  // DELETE EVENT
  // =========================

  function deleteEvent(id) {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this event?"
      )


    if (!confirmDelete) {
      return
    }


    const updatedEvents =
      events.filter(
        (event) =>
          event.id !== id
      )


    setEvents(updatedEvents)


    localStorage.setItem(
      "tantraEvents",
      JSON.stringify(
        updatedEvents
      )
    )


    // Remove related bookings

    const updatedBookings =
      bookings.filter(
        (booking) =>
          String(booking.eventId) !==
          String(id)
      )


    setBookings(updatedBookings)


    localStorage.setItem(
      "tantraEventBookings",
      JSON.stringify(
        updatedBookings
      )
    )


    window.dispatchEvent(
      new Event("eventsUpdated")
    )


    window.dispatchEvent(
      new Event("bookingUpdated")
    )


    if (
      selectedEvent &&
      String(selectedEvent.id) ===
      String(id)
    ) {

      setSelectedEvent(null)

    }

  }


  // =========================
  // CLOSE ADD/EDIT MODAL
  // =========================

  function closeForm() {

    setShowForm(false)

    setEditingEvent(null)

  }


  // =========================
  // PAGE
  // =========================

  return (

    <div className="teacher-events-page">


      {/* =========================
          HEADER
      ========================= */}

      <div className="teacher-events-header">

        <div>

          <p>
            EVENT MANAGEMENT
          </p>

          <h1>
            Academy Events 🎫
          </h1>

          <span>
            Create and manage concerts,
            workshops and academy events.
          </span>

        </div>


        <button
          className="add-event-btn"
          onClick={openAddForm}
        >
          + Add Event
        </button>

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <div className="teacher-events-summary">

        <div className="teacher-event-summary-card">

          <span>
            Total Events
          </span>

          <h2>
            {events.length}
          </h2>

          <p>
            Academy events
          </p>

        </div>


        <div className="teacher-event-summary-card">

          <span>
            Total Tickets Sold
          </span>

          <h2>

            {bookings.reduce(
              (total, booking) =>
                total +
                Number(
                  booking.tickets || 0
                ),
              0
            )}

          </h2>

          <p>
            Across all events
          </p>

        </div>

      </div>


      {/* =========================
          EVENTS
      ========================= */}

      {events.length === 0 ? (

        <div className="no-teacher-events">

          <div>
            🎫
          </div>

          <h2>
            No events yet
          </h2>

          <p>
            Click "Add Event" to create
            your first academy event.
          </p>

        </div>

      ) : (

        <div className="teacher-events-grid">

          {events.map((event) => {

            const eventBookings =
              getEventBookings(event.id)


            const totalTickets =
              getTotalTickets(event.id)


            const totalAmount =
              getTotalAmount(event.id)


            return (

              <div
                className="teacher-event-card"
                key={event.id}
              >

                {/* TOP */}

                <div className="teacher-event-top">

                  <div className="teacher-event-date">

                    <strong>
                      {event.date}
                    </strong>

                    <span>
                      {event.month}
                    </span>

                  </div>


                  <span className="teacher-event-price">
                    🎟️ ₹{event.ticketPrice}
                  </span>

                </div>


                {/* TITLE */}

                <h2>
                  {event.title}
                </h2>


                {/* DESCRIPTION */}

                <p className="teacher-event-description">
                  {event.description}
                </p>


                {/* DETAILS */}

                <div className="teacher-event-details">

                  <span>
                    🕐 {event.time}
                  </span>

                  <span>
                    📍 {event.location}
                  </span>

                </div>


                {/* BOOKING SUMMARY */}

                <div className="teacher-booking-summary">

                  <div>

                    <span>
                      Bookings
                    </span>

                    <strong>
                      {eventBookings.length}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Tickets Sold
                    </span>

                    <strong>
                      {totalTickets}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Revenue
                    </span>

                    <strong>
                      ₹{totalAmount}
                    </strong>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="teacher-event-actions">

                  <button
                    className="view-bookings-btn"
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    🎟️ View Bookings
                  </button>


                  <button
                    className="edit-event-btn"
                    onClick={() =>
                      openEditForm(event)
                    }
                  >
                    ✏️ Edit
                  </button>


                  <button
                    className="delete-event-btn"
                    onClick={() =>
                      deleteEvent(event.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            )

          })}

        </div>

      )}


      {/* =========================
          VIEW BOOKINGS MODAL
      ========================= */}

      {selectedEvent && (

        <div
          className="teacher-bookings-overlay"
          onClick={() =>
            setSelectedEvent(null)
          }
        >

          <div
            className="teacher-bookings-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="teacher-bookings-close"
              onClick={() =>
                setSelectedEvent(null)
              }
            >
              ✕
            </button>


            <p>
              EVENT BOOKINGS
            </p>


            <h2>
              {selectedEvent.title}
            </h2>


            {/* BOOKING STATS */}

            <div className="teacher-booking-stats">

              <div>

                <span>
                  Bookings
                </span>

                <strong>
                  {
                    getEventBookings(
                      selectedEvent.id
                    ).length
                  }
                </strong>

              </div>


              <div>

                <span>
                  Tickets
                </span>

                <strong>
                  {
                    getTotalTickets(
                      selectedEvent.id
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  Revenue
                </span>

                <strong>
                  ₹
                  {
                    getTotalAmount(
                      selectedEvent.id
                    )
                  }
                </strong>

              </div>

            </div>


            {/* BOOKINGS LIST */}

            {getEventBookings(
              selectedEvent.id
            ).length === 0 ? (

              <div className="no-event-bookings">

                <div>
                  🎟️
                </div>

                <h3>
                  No bookings yet
                </h3>

                <p>
                  Students have not booked
                  tickets for this event.
                </p>

              </div>

            ) : (

              <div className="event-bookings-list">

                {getEventBookings(
                  selectedEvent.id
                ).map((booking) => (

                  <div
                    className="event-booking-row"
                    key={booking.id}
                  >

                    <div className="booking-student-icon">
                      👤
                    </div>


                    <div className="booking-student-info">

                      <strong>
                        Student
                      </strong>

                      <span>
                        Booking ID: {booking.id}
                      </span>

                    </div>


                    <div className="booking-ticket-count">

                      <span>
                        Tickets
                      </span>

                      <strong>
                        {booking.tickets}
                      </strong>

                    </div>


                    <div className="booking-amount">

                      <span>
                        Amount
                      </span>

                      <strong>
                        ₹{booking.totalAmount}
                      </strong>

                    </div>


                    <span className="booking-status">
                      ✓ {booking.status}
                    </span>

                  </div>

                ))}

              </div>

            )}


            <button
              className="close-bookings-btn"
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
          ADD / EDIT EVENT MODAL
      ========================= */}

      {showForm && (

        <div
          className="teacher-event-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="teacher-event-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="teacher-event-modal-close"
              onClick={closeForm}
            >
              ✕
            </button>


            <p>
              {editingEvent
                ? "EDIT EVENT"
                : "NEW EVENT"}
            </p>


            <h2>
              {editingEvent
                ? "Edit Academy Event ✏️"
                : "Create Academy Event 🎫"}
            </h2>


            <input
              type="text"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value
                })
              }
            />


            <textarea
              placeholder="Event description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description:
                    e.target.value
                })
              }
            />


            <label>
              Event Date
            </label>

            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value
                })
              }
            />


            <label>
              Event Time
            </label>

            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time: e.target.value
                })
              }
            />


            <input
              type="text"
              placeholder="Location / Venue"
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value
                })
              }
            />


            <input
              type="number"
              placeholder="Ticket price ₹"
              min="0"
              value={formData.ticketPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ticketPrice:
                    e.target.value
                })
              }
            />


            <button
              className="save-event-btn"
              onClick={saveEvent}
            >
              {editingEvent
                ? "💾 Update Event"
                : "🎫 Create Event"}
            </button>

          </div>

        </div>

      )}

    </div>

  )

}

export default TeacherEvents