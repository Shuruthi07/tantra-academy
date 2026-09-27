import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Classes from "./Classes";
import About from "./About";

function Home() {
     const navigate = useNavigate();

  // =========================
  // EVENTS
  // =========================

  const events = [
    {
      image:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
      title: "Annual Music Concert",
      date: "December 15, 2026",
      description:
        "A special evening of music and live performances."
    },
    {
      image:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
      title: "Music Workshop",
      date: "January 10, 2027",
      description:
        "Learn new techniques from experienced musicians."
    },
    {
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
      title: "Student Performance",
      date: "February 5, 2027",
      description:
        "Watch our talented students perform live."
    }
  ];


  // =========================
  // GALLERY
  // =========================

  const gallery = [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",

    "https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=80",

    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=80",

    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80",

    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",

    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80"
  ];


  return (
    <>
      {/* =========================
          NAVBAR
      ========================== */}

      <Navbar />


      {/* =========================
          HERO
      ========================== */}

      <Hero />


      {/* =========================
          CLASSES
      ========================== */}

      <Classes />


      {/* =========================
          EVENTS
      ========================== */}

      <section className="home-events">

        <div className="home-section-heading">

          <p>WHAT'S HAPPENING</p>

          <h2>Upcoming Events</h2>

          <span>
            Join our concerts, workshops and special
            musical events.
          </span>

        </div>


        <div className="home-events-container">

          {events.map((event) => (

            <div
              className="home-event-card"
              key={event.title}
            >

              <img
                src={event.image}
                alt={event.title}
                className="home-event-image"
              />


              <div className="home-event-content">

                <h3>
                  {event.title}
                </h3>


                <p className="home-event-date">
                  📅 {event.date}
                </p>


                <p>
                  {event.description}
                </p>



              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =========================
          GALLERY
      ========================== */}

      <section className="home-gallery">

        <div className="home-section-heading">

          <p>OUR MEMORIES</p>

          <h2>Gallery</h2>

          <span>
            Explore beautiful moments from Tantra Academy.
          </span>

        </div>


        <div className="home-gallery-container">

          {gallery.map((image, index) => (

            <div
              className="home-gallery-item"
              key={index}
            >

              <img
                src={image}
                alt={`Tantra Academy ${index + 1}`}
              />

            </div>

          ))}

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================== */}

      <section className="home-about">

        <div className="home-about-content">

          <p className="home-about-label">
            ABOUT TANTRA ACADEMY
          </p>


          <h2>
            Where Passion
            <br />
            Becomes Music
          </h2>


          <p>
            Tantra Academy is a place where students
            can discover, learn and develop their passion
            for music. Our experienced teachers provide
            practical training in a friendly and creative
            environment.
          </p>


          <p>
            From beginners to advanced musicians,
            we help every student build confidence,
            improve their skills and enjoy their
            musical journey.
          </p>


          <button className="home-about-btn">
            Learn More
          </button>

        </div>


        <div className="home-about-image">

          <div className="home-about-music">
            🎵
          </div>

        </div>

      </section>

    </>
  );
}

export default Home;