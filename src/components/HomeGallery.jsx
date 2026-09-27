const homeGallery = [
  {
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
    title: "Live Performance"
  },
  {
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    title: "Vocal Training"
  },
  {
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=80",
    title: "Piano Session"
  },
  {
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
    title: "Music Practice"
  },
  {
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    title: "Stage Performance"
  },
  {
    image:
      "https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=80",
    title: "Music Academy"
  }
];

function HomeGallery() {
  return (
    <section className="home-gallery-section">

      <div className="home-gallery-heading">
        <p>OUR MEMORIES</p>

        <h2>Gallery</h2>

        <span>
          Moments from our classes, performances and musical events.
        </span>
      </div>

      <div className="home-gallery-grid">

        {homeGallery.map((photo) => (
          <div
            className="home-gallery-card"
            key={photo.title}
          >

            <img
              src={photo.image}
              alt={photo.title}
            />

            <div className="home-gallery-overlay">
              <h3>{photo.title}</h3>
            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default HomeGallery;