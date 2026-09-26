import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountType: "Student"
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))

    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      accountType
    } = formData

    // Validation
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (accountType !== "Student") {
      setError("Only Student accounts are currently available.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        "https://tantra-academy-1.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password: password,
            role: "student"
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed.")
        return
      }

      // Save basic student information locally
      localStorage.setItem(
        "tantraStudentProfile",
        JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim()
        })
      )

      alert("Account created successfully! Please login.")

      navigate("/login")

    } catch (error) {
      console.error("Registration error:", error)

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-logo">
          🎵
        </div>

        <h1>
          Create Account
        </h1>

        <p className="register-subtitle">
          Join Tantra Academy
        </p>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label>
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />

          <label>
            Account Type
          </label>

          <select
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
          >
            <option value="Student">
              Student
            </option>

            <option value="Parent">
              Parent
            </option>
          </select>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="already-account">

          Already have an account?

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </div>
  )
}

export default Register