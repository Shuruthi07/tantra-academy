const events = [
  {
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
    title: "Annual Music Concert",
    date: "December 15, 2026",
    description: "A special evening of music and live performances."
  },
  {
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
    title: "Music Workshop",
    date: "January 10, 2027",
    description: "Learn new techniques from experienced musicians."
  },
  {
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    title: "Student Performance",
    date: "February 5, 2027",
    description: "Watch our talented students perform live."
  }
];

function EventsGallery() {
  return (
    <section className="events-section">

      <div className="events-heading">
        <p>WHAT'S HAPPENING</p>

        <h2>Upcoming Events</h2>

        <span>
          Join our concerts, workshops and special musical events.
        </span>
      </div>

      <div className="events-container">

        {events.map((event) => (
          <div className="event-card" key={event.title}>

            <img
              src={event.image}
              alt={event.title}
              className="event-image"
            />

            <div className="event-content">

              <h3>{event.title}</h3>

              <p className="event-date">
                📅 {event.date}
              </p>

              <p>
                {event.description}
              </p>

              <button className="event-btn">
                View Event
              </button>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default EventsGallery;