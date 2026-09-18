const classes = [
  {
    icon: "🎤",
    title: "Vocal Training",
    description: "Improve your voice, pitch, breathing and singing techniques.",
    level: "Beginner to Advanced"
  },
  {
    icon: "🎹",
    title: "Piano",
    description: "Learn piano fundamentals, chords, melodies and performance.",
    level: "Beginner to Advanced"
  },
  {
    icon: "🎸",
    title: "Guitar",
    description: "Master chords, strumming, fingerstyle and popular songs.",
    level: "Beginner to Advanced"
  },
  {
    icon: "🥁",
    title: "Drums",
    description: "Build rhythm, timing and coordination through practical training.",
    level: "Beginner to Intermediate"
  },
  {
    icon: "🎻",
    title: "Violin",
    description: "Develop technique, rhythm and musical expression.",
    level: "Beginner to Advanced"
  },
  {
    icon: "🎼",
    title: "Music Theory",
    description: "Understand scales, notes, chords, rhythm and musical notation.",
    level: "All Levels"
  }
]

function Classes() {
  return (
    <section className="classes-section">

      <div className="section-heading">
        <p>EXPLORE YOUR PASSION</p>

        <h2>Our Classes</h2>

        <span>
          Learn from experienced teachers and discover
          the musician within you.
        </span>
      </div>

      <div className="classes-container">

        {classes.map((musicClass) => (
          <div className="class-card" key={musicClass.title}>

            <div className="class-icon">
              {musicClass.icon}
            </div>

            <h3>{musicClass.title}</h3>

            <p>{musicClass.description}</p>

            <span className="class-level">
              {musicClass.level}
            </span>

            <button>
              Explore Class →
            </button>

          </div>
        ))}

      </div>

    </section>
  )
}

export default Classes