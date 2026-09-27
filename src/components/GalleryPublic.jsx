const galleryImages = [
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=80"
];

function GalleryPublic() {
  return (
    <section className="gallery-section">

      <div className="gallery-heading">
        <p>OUR MOMENTS</p>

        <h2>Music Gallery</h2>

        <span>
          Explore beautiful moments from Tantra Academy.
        </span>
      </div>

      <div className="gallery-container">

        {galleryImages.map((image, index) => (
          <div className="gallery-card" key={index}>
            <img
              src={image}
              alt={`Tantra Academy ${index + 1}`}
            />
          </div>
        ))}

      </div>

    </section>
  );
}

export default GalleryPublic;