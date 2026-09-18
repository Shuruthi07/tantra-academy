import { Link } from "react-router-dom"
function Navbar() {
  return (
    <nav>
      <div className="logo">
        🎵 TANTRA ACADEMY
      </div>

      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">Classes</a>
        <a href="#">Events</a>
        <a href="#">Gallery</a>
        <a href="#">About</a>
      </div>

      <div className="nav-buttons">
        <Link to="/login" className="login-btn">Login</Link>
        <Link to="/register" className="join-btn">Join Now</Link>
      </div>
    </nav>
  )
}

export default Navbar