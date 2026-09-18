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


  function handleChange(e) {

    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))

    setError("")
  }


  function handleSubmit(e) {

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

      setError(
        "Password must contain at least 6 characters."
      )

      return
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      )

      return
    }


    if (accountType !== "Student") {

      setError(
        "Only Student accounts are currently available."
      )

      return
    }


    // Get existing accounts

    const existingAccounts =
      JSON.parse(
        localStorage.getItem("tantraAccounts")
      ) || []


    // Check duplicate email

    const emailExists =
      existingAccounts.some(
        (account) =>
          account.email.toLowerCase() ===
          email.trim().toLowerCase()
      )


    if (emailExists) {

      setError(
        "An account with this email already exists."
      )

      return
    }


    // Create account

    const newAccount = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password,
      accountType: accountType
    }


    existingAccounts.push(newAccount)


    localStorage.setItem(
      "tantraAccounts",
      JSON.stringify(existingAccounts)
    )


    // Save basic student information

    localStorage.setItem(
      "tantraStudentProfile",
      JSON.stringify({
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone
      })
    )


    alert(
      "Account created successfully! Please login."
    )


    navigate("/login")

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
          >
            Create Account
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