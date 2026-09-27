import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav>
      <div className="logo">
        🎵 TANTRA ACADEMY
      </div>

        <div className="nav-links">
  <Link to="/">Home</Link>
  <Link to="/classes">Classes</Link>
  <Link to="/events-gallery">
          Events
        </Link>
  <Link to="/gallery-public">Gallery</Link>
  <Link to="/about">About</Link>
</div>

      <div className="nav-buttons">
        <Link to="/login" className="login-btn">
          Login
        </Link>

        <Link to="/register" className="join-btn">
          Join Now
        </Link>
      </div>
    </nav>
  )
}

export default Navbar