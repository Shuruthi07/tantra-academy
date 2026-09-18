function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <p className="hero-tag">
          🎵 DISCOVER YOUR MUSICAL JOURNEY
        </p>

        <h1>
          Find Your Rhythm.
          <br />
          Master Your Music.
        </h1>

        <p className="hero-description">
          Learn, practice and perform with Tantra Academy.
          Build your musical skills with expert guidance
          and a community that inspires you.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">
            Start Learning
          </button>

          <button className="secondary-btn">
            Explore Classes
          </button>
        </div>

      </div>

      <div className="hero-visual">

        <div className="music-circle">
          🎵
        </div>

        <div className="floating-note note-one">
          ♪
        </div>

        <div className="floating-note note-two">
          ♫
        </div>

        <div className="floating-note note-three">
          ♬
        </div>

      </div>

    </section>
  )
}

export default Hero