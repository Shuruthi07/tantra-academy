import { useEffect, useState } from "react"

const EVENTS_API =
  "https://tantra-academy-1.onrender.com/api/events"


function Events() {

  // =====================================================
  // STATE
  // =====================================================

  const [events, setEvents] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [bookings, setBookings] =
    useState([])

  const [selectedEvent, setSelectedEvent] =
    useState(null)

  const [showPayment, setShowPayment] =
    useState(false)

  const [ticketCount, setTicketCount] =
    useState(1)

  const [bookingLoading, setBookingLoading] =
    useState(false)


  // =====================================================
  // AUTH HEADERS
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
  // GET CURRENT STUDENT
  // =====================================================

  function getLoggedInStudent() {

    try {

      const currentUser =
        sessionStorage.getItem(
          "tantraCurrentUser"
        )

      if (currentUser) {

        return JSON.parse(
          currentUser
        )

      }


      const loggedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (loggedUser) {

        return JSON.parse(
          loggedUser
        )

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
  // LOAD EVENTS
  // =====================================================

  async function loadEvents() {

    try {

      setLoading(true)

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )


      if (!token) {

        console.error(
          "Student authentication token not found."
        )

        setEvents([])

        return
      }


      const response =
        await fetch(
          EVENTS_API,
          {
            method: "GET",

            headers:
              getAuthHeaders(),

            cache: "no-store"
          }
        )


      const data =
        await response.json()


      console.log(
        "Student Events API:",
        response.status,
        data
      )


      if (
        response.ok &&
        data.success &&
        Array.isArray(
          data.events
        )
      ) {

        setEvents(
          data.events
        )

      } else {

        console.error(
          "Unable to load events:",
          data
        )

        setEvents([])

      }

    } catch (error) {

      console.error(
        "Events loading error:",
        error
      )

      setEvents([])

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // LOAD STUDENT BOOKINGS
  // =====================================================

  async function loadBookings() {

    const student =
      getLoggedInStudent()


    if (!student) {

      setBookings([])

      return
    }


    const studentId =
      student.id ||
      student._id ||
      student.userId


    if (!studentId) {

      setBookings([])

      return
    }


    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    if (!token) {

      setBookings([])

      return
    }


    try {

      const allBookings = []


      for (
        const event of events
      ) {

        try {

          const response =
            await fetch(
              `${EVENTS_API}/${event.id}/bookings`,
              {
                method: "GET",

                headers:
                  getAuthHeaders(),

                cache: "no-store"
              }
            )


          const data =
            await response.json()


          console.log(
            "Booking API:",
            event.id,
            response.status,
            data
          )


          if (
            response.ok &&
            data.success
          ) {

            const studentBookings =
              (
                data.bookings ||
                []
              ).filter(
                booking =>
                  String(
                    booking.studentId
                  ) ===
                  String(studentId)
              )


            studentBookings.forEach(
              booking => {

                allBookings.push({

                  ...booking,

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
                    event.ticketPrice

                })

              }
            )

          }

        } catch (error) {

          console.error(
            "Booking load error:",
            error
          )

        }

      }


      setBookings(
        allBookings
      )

    } catch (error) {

      console.error(
        "Student bookings error:",
        error
      )

      setBookings([])

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadEvents()

  }, [])


  // =====================================================
  // LOAD BOOKINGS AFTER EVENTS
  // =====================================================

  useEffect(() => {

    if (
      !loading &&
      events.length > 0
    ) {

      loadBookings()

    }

  }, [
    events,
    loading
  ])


  // =====================================================
  // CHECK BOOKED
  // =====================================================

  function isEventBooked(
    eventId
  ) {

    return bookings.some(
      booking =>
        String(
          booking.eventId
        ) ===
        String(eventId)
    )

  }


  // =====================================================
  // OPEN EVENT
  // =====================================================

  function openEvent(event) {

    setSelectedEvent(
      event
    )

    setTicketCount(1)

    setShowPayment(false)

  }


  // =====================================================
  // CLOSE EVENT
  // =====================================================

  function closeEvent() {

    if (bookingLoading) {
      return
    }

    setSelectedEvent(null)

    setShowPayment(false)

    setTicketCount(1)

  }


  // =====================================================
  // OPEN PAYMENT
  // =====================================================

  function openPayment() {

    if (!selectedEvent) {
      return
    }


    const student =
      getLoggedInStudent()


    if (!student) {

      alert(
        "Please login as a student first."
      )

      return
    }


    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    if (!token) {

      alert(
        "Your login session has expired. Please login again."
      )

      return
    }


    const studentId =
      student.id ||
      student._id ||
      student.userId


    if (!studentId) {

      alert(
        "Student account information is missing."
      )

      return
    }


    if (
      isEventBooked(
        selectedEvent.id
      )
    ) {

      alert(
        "You have already booked this event. 🎟️"
      )

      return
    }


    if (
      ticketCount < 1
    ) {

      alert(
        "Please select at least 1 ticket."
      )

      return
    }


    setShowPayment(true)

  }


  // =====================================================
  // CONFIRM PAYMENT + BOOK
  // =====================================================

  async function confirmPayment() {

    if (!selectedEvent) {
      return
    }


    const student =
      getLoggedInStudent()


    if (!student) {

      alert(
        "Please login as a student first."
      )

      return
    }


    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    if (!token) {

      alert(
        "Your login session has expired. Please login again."
      )

      return
    }


    const studentId =
      student.id ||
      student._id ||
      student.userId


    const studentName =
      student.name ||
      student.studentName ||
      "Student"


    if (!studentId) {

      alert(
        "Student account information is missing."
      )

      return
    }


    if (
      isEventBooked(
        selectedEvent.id
      )
    ) {

      alert(
        "You have already booked this event. 🎟️"
      )

      setShowPayment(false)

      return
    }


    try {

      setBookingLoading(true)


      const response =
        await fetch(
          `${EVENTS_API}/${selectedEvent.id}/bookings`,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                studentId:
                  studentId,

                studentName:
                  studentName,

                tickets:
                  Number(
                    ticketCount
                  ),

                paymentStatus:
                  "Payment Submitted"

              })
          }
        )


      const data =
        await response.json()


      console.log(
        "Event booking response:",
        response.status,
        data
      )


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to confirm booking."
        )

        return
      }


      await loadBookings()


      alert(
        "Payment submitted successfully! 🎉\n\nYour event ticket has been booked."
      )


      setShowPayment(false)

      setSelectedEvent(null)

      setTicketCount(1)

    } catch (error) {

      console.error(
        "Event booking error:",
        error
      )

      alert(
        "Unable to connect to the server."
      )

    } finally {

      setBookingLoading(false)

    }

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <section className="events-section">


      {/* =================================================
          HEADER
      ================================================= */}

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


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="no-events">

          <div>
            🎫
          </div>

          <h2>
            Loading Events...
          </h2>

          <p>
            Please wait while we load academy events.
          </p>

        </div>

      ) : events.length === 0 ? (

        <div className="no-events">

          <div>
            🎫
          </div>

          <h2>
            No upcoming events
          </h2>

          <p>
            Your teacher has not added any upcoming events.
          </p>

        </div>

      ) : (

        <div className="events-container">

          {events.map(
            event => {

              const isBooked =
                isEventBooked(
                  event.id
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


                  {/* EVENT INFO */}

                  <div className="event-info">

                    <h3>
                      {event.title}
                    </h3>


                    <p>
                      {event.description ||
                        "Join us for this special academy event."}
                    </p>


                    <div className="event-details">

                      <span>
                        🕐 {event.time}
                      </span>


                      <span>
                        📍 {event.location}
                      </span>


                      <span>
                        🎟️ ₹
                        {Number(
                          event.ticketPrice || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                        {" / ticket"}
                      </span>

                    </div>


                    <button
                      type="button"
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

            }
          )}

        </div>

      )}


      {/* =================================================
          EVENT DETAILS MODAL
      ================================================= */}

      {selectedEvent &&
        !showPayment && (

        <div
          className="event-modal-overlay"
          onClick={closeEvent}
        >

          <div
            className="event-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="event-modal-close"
              onClick={closeEvent}
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

              {selectedEvent.description ||
                "Join us for this special academy event."}

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
                  ₹
                  {Number(
                    selectedEvent.ticketPrice || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>


            {isEventBooked(
              selectedEvent.id
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

                <div className="ticket-booking-box">

                  <div>

                    <span>
                      Ticket Price
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedEvent.ticketPrice || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>


                  <div className="ticket-quantity">

                    <span>
                      Number of Tickets
                    </span>


                    <div className="quantity-controls">

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


                  <div className="ticket-total">

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
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>


                <button
                  type="button"
                  className="event-register-btn"
                  onClick={openPayment}
                >
                  🎟️ Book Ticket
                </button>

              </>

            )}


            <button
              type="button"
              className="event-close-btn"
              onClick={closeEvent}
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* =================================================
          PAYMENT MODAL
      ================================================= */}

      {selectedEvent &&
        showPayment && (

        <div
          className="event-modal-overlay"
          onClick={() => {

            if (!bookingLoading) {
              setShowPayment(false)
            }

          }}
        >

          <div
            className="event-payment-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="event-modal-close"
              onClick={() => {

                if (!bookingLoading) {
                  setShowPayment(false)
                }

              }}
            >
              ✕
            </button>


            <div className="event-payment-icon">
              💳
            </div>


            <p className="event-payment-label">
              EVENT PAYMENT
            </p>


            <h2>
              Pay for Your Ticket
            </h2>


            <p className="event-payment-subtitle">
              Complete the payment to confirm
              your event booking.
            </p>


            <div className="event-payment-summary">

              <div>

                <span>
                  Event
                </span>

                <strong>
                  {selectedEvent.title}
                </strong>

              </div>


              <div>

                <span>
                  Tickets
                </span>

                <strong>
                  {ticketCount}
                </strong>

              </div>


              <div>

                <span>
                  Amount
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
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>


            <div className="event-payment-qr">

              <img
                src="/upi-qr.jpeg"
                alt="UPI Payment QR Code"
              />

            </div>


            <p className="event-payment-scan">
              Scan the QR code using
              PhonePe or another UPI app.
            </p>


            <div className="event-payment-note">

              <strong>
                💡 Payment Instructions
              </strong>


              <p>
                1. Scan the QR code.
              </p>


              <p>
                2. Pay the exact amount shown above.
              </p>


              <p>
                3. Complete the UPI payment.
              </p>


              <p>
                4. Click "I've Paid" below.
              </p>

            </div>


            <button
              type="button"
              className="event-paid-btn"
              onClick={
                confirmPayment
              }
              disabled={
                bookingLoading
              }
            >

              {bookingLoading
                ? "Confirming..."
                : "✓ I've Paid"}

            </button>


            <button
              type="button"
              className="event-cancel-payment-btn"
              onClick={() => {

                if (!bookingLoading) {
                  setShowPayment(false)
                }

              }}
              disabled={
                bookingLoading
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