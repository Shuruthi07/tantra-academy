import React, { useEffect, useState } from "react"

const EVENTS_API =
  "http://127.0.0.1:5000/api/events"

const NOTIFICATIONS_API =
  "http://127.0.0.1:5000/api/notifications"

const STUDENTS_API =
  "http://127.0.0.1:5000/api/admin/teacher-students"

function TeacherEvents() {
  const [events, setEvents] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [showBookings, setShowBookings] = useState(false)

  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [bookings, setBookings] = useState([])

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    ticketPrice: ""
  })

  // =========================================
  // JWT HEADERS
  // =========================================

  function getAuthHeaders() {
    const token = sessionStorage.getItem(
      "tantraAuthToken"
    )

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    }
  }

  // =========================================
  // LOAD EVENTS
  // =========================================

  const loadEvents = async () => {
    try {
      setLoading(true)

      const response = await fetch(EVENTS_API, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store"
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setEvents(
          Array.isArray(data.events)
            ? data.events
            : []
        )
      } else {
        alert(
          data.message ||
            "Unable to load events."
        )
      }
    } catch (error) {
      console.error(
        "Events loading error:",
        error
      )

      alert(
        "Unable to connect to the server."
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================
  // LOAD STUDENTS
  // =========================================

  const loadStudents = async () => {
    try {
      const response = await fetch(
        STUDENTS_API,
        {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store"
        }
      )

      const data = await response.json()

      if (
        response.ok &&
        data.success
      ) {
        setStudents(
          Array.isArray(data.students)
            ? data.students
            : []
        )
      } else {
        setStudents([])
      }
    } catch (error) {
      console.error(
        "Students loading error:",
        error
      )

      setStudents([])
    }
  }

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadEvents()
    loadStudents()

    function handleEventsUpdated() {
      loadEvents()
    }

    window.addEventListener(
      "eventsUpdated",
      handleEventsUpdated
    )

    return () => {
      window.removeEventListener(
        "eventsUpdated",
        handleEventsUpdated
      )
    }
  }, [])

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  // =========================================
  // OPEN ADD MODAL
  // =========================================

  const openAddModal = () => {
    setEditingEvent(null)

    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      ticketPrice: ""
    })

    setShowModal(true)
  }

  // =========================================
  // DATE CONVERSION
  // =========================================

  const convertStoredDate = (event) => {
    if (!event.date) {
      return ""
    }

    // If backend already returns YYYY-MM-DD
    if (
      typeof event.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        event.date
      )
    ) {
      return event.date
    }

    if (!event.month) {
      return ""
    }

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
      monthMap[
        String(event.month)
          .toUpperCase()
          .slice(0, 3)
      ]

    if (!month) {
      return ""
    }

    const day = String(
      event.date
    ).padStart(2, "0")

    const year =
      event.year ||
      new Date().getFullYear()

    return `${year}-${month}-${day}`
  }

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const openEditModal = (event) => {
    setEditingEvent(event)

    setForm({
      title: event.title || "",

      description:
        event.description || "",

      date: convertStoredDate(event),

      time: event.time || "",

      location:
        event.location || "",

      ticketPrice:
        event.ticketPrice ??
        ""
    })

    setShowModal(true)
  }

  // =========================================
  // SAVE EVENT
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      alert(
        "Please enter event title."
      )
      return
    }

    if (!form.date) {
      alert(
        "Please select event date."
      )
      return
    }

    try {
      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim(),

        date: form.date,

        time: form.time.trim(),

        location:
          form.location.trim(),

        ticketPrice:
          Number(form.ticketPrice) || 0
      }

      let response

      if (editingEvent) {
        response = await fetch(
          `${EVENTS_API}/${editingEvent.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          }
        )
      } else {
        response = await fetch(
          EVENTS_API,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          }
        )
      }

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            "Unable to save event."
        )
        return
      }

      // =====================================
      // NOTIFY STUDENTS
      // =====================================

      await notifyStudents(
        editingEvent
          ? "Event updated 🎫"
          : "New academy event 🎫",
        editingEvent
          ? `${payload.title} has been updated.`
          : `${payload.title} has been added to the academy events.`
      )

      alert(
        editingEvent
          ? "Event updated successfully! ✅"
          : "Event created successfully! ✅"
      )

      setShowModal(false)
      setEditingEvent(null)

      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        ticketPrice: ""
      })

      await loadEvents()

      window.dispatchEvent(
        new Event("eventsUpdated")
      )
    } catch (error) {
      console.error(
        "Event save error:",
        error
      )

      alert(
        "Unable to connect to server."
      )
    }
  }

  // =========================================
  // DELETE EVENT
  // =========================================

  const handleDelete = async (
    eventId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this event?"
      )

    if (!confirmed) {
      return
    }

    try {
      const response =
        await fetch(
          `${EVENTS_API}/${eventId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders()
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            "Unable to delete event."
        )
        return
      }

      alert(
        "Event deleted successfully! 🗑️"
      )

      await loadEvents()

      window.dispatchEvent(
        new Event("eventsUpdated")
      )
    } catch (error) {
      console.error(
        "Event delete error:",
        error
      )

      alert(
        "Unable to connect to server."
      )
    }
  }

  // =========================================
  // LOAD BOOKINGS
  // =========================================

  const viewBookings = async (
    event
  ) => {
    try {
      setSelectedEvent(event)

      const response =
        await fetch(
          `${EVENTS_API}/${event.id}/bookings`,
          {
            method: "GET",
            headers: getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      if (
        response.ok &&
        data.success
      ) {
        setBookings(
          Array.isArray(data.bookings)
            ? data.bookings
            : []
        )

        setShowBookings(true)
      } else {
        alert(
          data.message ||
            "Unable to load bookings."
        )
      }
    } catch (error) {
      console.error(
        "Bookings loading error:",
        error
      )

      alert(
        "Unable to load bookings."
      )
    }
  }

  // =========================================
  // NOTIFY STUDENTS
  // =========================================

  const notifyStudents = async (
    title,
    message
  ) => {
    if (!students.length) {
      return
    }

    try {
      await Promise.all(
        students.map(
          async (student) => {
            const studentId =
              student.id ||
              student._id

            if (!studentId) {
              return
            }

            await fetch(
              NOTIFICATIONS_API,
              {
                method: "POST",
                headers:
                  getAuthHeaders(),
                body: JSON.stringify({
                  userId:
                    String(studentId),
                  title,
                  message,
                  type: "event"
                })
              }
            )
          }
        )
      )
    } catch (error) {
      console.error(
        "Student notification error:",
        error
      )
    }
  }

  // =========================================
  // TOTAL TICKETS
  // =========================================

  const getTotalTickets = () => {
    return bookings.reduce(
      (total, booking) =>
        total +
        Number(
          booking.tickets || 0
        ),
      0
    )
  }

  // =========================================
  // TOTAL REVENUE
  // =========================================

  const getTotalRevenue = () => {
    return bookings.reduce(
      (total, booking) =>
        total +
        Number(
          booking.totalAmount || 0
        ),
      0
    )
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="teacher-events-page">

      {/* HEADER */}

      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1>🎫 Events</h1>

          <p>
            Create and manage academy events
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="primary-btn"
        >
          ➕ Add Event
        </button>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="empty-state">
          <h3>
            Loading events...
          </h3>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div
            style={{
              fontSize: "50px"
            }}
          >
            🎭
          </div>

          <h2>
            No Events Yet
          </h2>

          <p>
            Create your first academy event.
          </p>

          <button
            onClick={openAddModal}
            className="primary-btn"
          >
            ➕ Create Event
          </button>
        </div>
      ) : (
        <div className="events-grid">

          {events.map((event) => (
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

              {/* CONTENT */}

              <div className="event-content">

                <h2>
                  {event.title}
                </h2>

                <p>
                  {event.description ||
                    "No description available."}
                </p>

                <div className="event-details">

                  <span>
                    🕐{" "}
                    {event.time ||
                      "Time not specified"}
                  </span>

                  <span>
                    📍{" "}
                    {event.location ||
                      "Location not specified"}
                  </span>

                  <span>
                    🎟️ ₹
                    {Number(
                      event.ticketPrice || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="event-actions">

                  <button
                    onClick={() =>
                      openEditModal(event)
                    }
                    className="secondary-btn"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      viewBookings(event)
                    }
                    className="secondary-btn"
                  >
                    👥 Bookings
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(event.id)
                    }
                    className="danger-btn"
                  >
                    🗑️ Delete
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >
          <div
            className="modal-box"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                {editingEvent
                  ? "✏️ Edit Event"
                  : "➕ Add Event"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="close-btn"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
            >

              <label>
                Event Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows="4"
              />

              <label>
                Event Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />

              <label>
                Time
              </label>

              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter event location"
              />

              <label>
                Ticket Price
              </label>

              <input
                type="number"
                name="ticketPrice"
                value={form.ticketPrice}
                onChange={handleChange}
                placeholder="Enter ticket price"
                min="0"
              />

              <div className="modal-actions">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="secondary-btn"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editingEvent
                    ? "Update Event"
                    : "Create Event"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKINGS MODAL */}

      {showBookings && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowBookings(false)
          }
        >
          <div
            className="modal-box"
            style={{
              maxWidth: "800px"
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  👥 Event Bookings
                </h2>

                {selectedEvent && (
                  <p>
                    {selectedEvent.title}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  setShowBookings(false)
                }
                className="close-btn"
              >
                ✕
              </button>

            </div>

            {/* SUMMARY */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "15px",
                marginBottom: "20px"
              }}
            >

              <div className="summary-card">
                <strong>
                  {bookings.length}
                </strong>

                <span>
                  Bookings
                </span>
              </div>

              <div className="summary-card">
                <strong>
                  {getTotalTickets()}
                </strong>

                <span>
                  Tickets
                </span>
              </div>

              <div className="summary-card">
                <strong>
                  ₹
                  {getTotalRevenue().toLocaleString(
                    "en-IN"
                  )}
                </strong>

                <span>
                  Revenue
                </span>
              </div>

            </div>

            {bookings.length === 0 ? (
              <div className="empty-state">
                <h3>
                  No bookings yet
                </h3>

                <p>
                  Students have not booked
                  this event yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto"
                }}
              >
                <table className="data-table">

                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Tickets</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map(
                      (booking) => (
                        <tr
                          key={booking.id}
                        >
                          <td>
                            {booking.studentName ||
                              "Student"}
                          </td>

                          <td>
                            {booking.tickets}
                          </td>

                          <td>
                            ₹
                            {Number(
                              booking.totalAmount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            {booking.status ||
                              "Booked"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                </table>
              </div>
            )}

            <div
              className="modal-actions"
              style={{
                marginTop: "20px"
              }}
            >
              <button
                onClick={() =>
                  setShowBookings(false)
                }
                className="primary-btn"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherEvents