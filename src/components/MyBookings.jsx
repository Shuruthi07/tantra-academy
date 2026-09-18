import { useEffect, useState } from "react"

function MyBookings() {

  // ==============================
  // BOOKINGS STATE
  // ==============================

  const [bookings, setBookings] = useState(() =>
    JSON.parse(
      localStorage.getItem(
        "tantraEventBookings"
      )
    ) || []
  )


  const [selectedTicket, setSelectedTicket] =
    useState(null)


  // ==============================
  // LOAD LIVE BOOKINGS
  // ==============================

  useEffect(() => {

    function loadBookings() {

      const savedBookings =
        JSON.parse(
          localStorage.getItem(
            "tantraEventBookings"
          )
        ) || []


      setBookings(savedBookings)


      // If the currently open ticket
      // was deleted, close the ticket

      setSelectedTicket((currentTicket) => {

        if (!currentTicket) {
          return null
        }


        const stillExists =
          savedBookings.some(
            (booking) =>
              booking.id ===
              currentTicket.id
          )


        return stillExists
          ? currentTicket
          : null

      })

    }


    window.addEventListener(
      "storage",
      loadBookings
    )

    window.addEventListener(
      "bookingUpdated",
      loadBookings
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadBookings
      )

      window.removeEventListener(
        "bookingUpdated",
        loadBookings
      )

    }

  }, [])


  // ==============================
  // CLOSE TICKET
  // ==============================

  function closeTicket() {

    setSelectedTicket(null)

  }


  return (

    <div className="bookings-page">


      {/* ==============================
          HEADER
      ============================== */}

      <div className="bookings-header">

        <div>

          <p>
            MY EVENTS
          </p>


          <h1>
            My Tickets 🎫
          </h1>


          <span>
            View your upcoming event bookings and tickets.
          </span>

        </div>


        <div className="booking-count">

          {bookings.length}{" "}
          {bookings.length === 1
            ? "Booking"
            : "Bookings"}

        </div>

      </div>



      {/* ==============================
          BOOKINGS
      ============================== */}

      {bookings.length === 0 ? (

        <div className="no-bookings">

          <div>
            🎫
          </div>


          <h2>
            No tickets booked yet
          </h2>


          <p>
            Book a ticket from the Events page
            to see it here.
          </p>

        </div>

      ) : (

        <div className="bookings-grid">

          {bookings.map((booking) => (

            <div
              className="booking-card"
              key={booking.id}
            >


              {/* TOP */}

              <div className="booking-card-top">

                <div className="booking-event-icon">
                  🎵
                </div>


                <span className="booking-confirmed">
                  ✓ {booking.status || "Confirmed"}
                </span>

              </div>



              {/* EVENT NAME */}

              <h2>
                {booking.eventTitle}
              </h2>



              {/* DETAILS */}

              <div className="booking-details">


                <div>

                  <span>
                    📅 Date
                  </span>

                  <strong>
                    {booking.date}{" "}
                    {booking.month}
                  </strong>

                </div>



                <div>

                  <span>
                    🕐 Time
                  </span>

                  <strong>
                    {booking.time}
                  </strong>

                </div>



                <div>

                  <span>
                    📍 Location
                  </span>

                  <strong>
                    {booking.location}
                  </strong>

                </div>



                <div>

                  <span>
                    🎟️ Tickets
                  </span>

                  <strong>
                    {booking.tickets}
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
                    {Number(
                      booking.totalAmount || 0
                    ).toLocaleString()}
                  </strong>

                </div>

              </div>



              {/* VIEW TICKET */}

              <button
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

          ))}

        </div>

      )}



      {/* ==============================
          DIGITAL TICKET POPUP
      ============================== */}

      {selectedTicket && (

        <div
          className="ticket-modal-overlay"
          onClick={closeTicket}
        >


          <div
            className="digital-ticket"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* CLOSE */}

            <button
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


            <div className="ticket-divider"></div>



            {/* EVENT */}

            <h2>
              {selectedTicket.eventTitle}
            </h2>



            {/* EVENT INFORMATION */}

            <div className="ticket-info">


              <div>

                <span>
                  📅 Date
                </span>

                <strong>
                  {selectedTicket.date}{" "}
                  {selectedTicket.month}
                </strong>

              </div>



              <div>

                <span>
                  🕐 Time
                </span>

                <strong>
                  {selectedTicket.time}
                </strong>

              </div>



              <div>

                <span>
                  📍 Location
                </span>

                <strong>
                  {selectedTicket.location}
                </strong>

              </div>



              <div>

                <span>
                  🎟️ Tickets
                </span>

                <strong>
                  {selectedTicket.tickets}
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
                  {Number(
                    selectedTicket.totalAmount ||
                    0
                  ).toLocaleString()}
                </strong>

              </div>

            </div>



            {/* CONFIRMATION */}

            <div className="ticket-confirmed">
              ✓ BOOKING CONFIRMED
            </div>



            {/* TICKET ACTIONS */}

            <div className="ticket-actions">


              <button
                className="ticket-print-btn"
                onClick={() =>
                  window.print()
                }
              >
                🖨️ Print Ticket
              </button>



              <button
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