import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")


  // =========================================
  // LOAD REMEMBERED EMAIL
  // =========================================

  useEffect(() => {

    const rememberedEmail =
      localStorage.getItem("tantraRememberedEmail")

    if (rememberedEmail) {

      setEmail(rememberedEmail)
      setRememberMe(true)

    }

  }, [])


  // =========================================
  // LOGIN
  // =========================================

  function handleSubmit(e) {

    e.preventDefault()

    setError("")


    const enteredEmail =
      email.trim().toLowerCase()

    const enteredPassword =
      password


    // =========================================
    // VALIDATION
    // =========================================

    if (!enteredEmail || !enteredPassword) {

      setError(
        "Please enter your email and password."
      )

      return
    }


    // =========================================
    // TEACHER LOGIN
    // =========================================

    if (
      enteredEmail ===
        "teacher@tantraacademy.com" &&
      enteredPassword ===
        "teacher123"
    ) {

      const teacherUser = {

        id: "teacher-001",

        name: "M. Shuruthi",

        email: "teacher@tantraacademy.com",

        phone: "",

        accountType: "Teacher"

      }


      // Save teacher login

      localStorage.setItem(
        "tantraLoggedInUser",
        JSON.stringify(teacherUser)
      )


      // Save teacher profile

      const existingTeacherProfile =
        JSON.parse(
          localStorage.getItem(
            "tantraTeacherProfile"
          )
        )


      if (!existingTeacherProfile) {

        localStorage.setItem(
          "tantraTeacherProfile",
          JSON.stringify({
            name: "M. Shuruthi",
            role: "Music Teacher",
            bio: "Passionate about teaching music and helping students discover their musical potential.",
            specialization: "Music & Vocal Training",
            instagram: "https://www.instagram.com/",
            spotify: "",
            facebook: "",
            youtube: "",
            linkedin: ""
          })
        )

      }


      // Remember email

      if (rememberMe) {

        localStorage.setItem(
          "tantraRememberedEmail",
          enteredEmail
        )

      } else {

        localStorage.removeItem(
          "tantraRememberedEmail"
        )

      }


      // IMPORTANT:
      // Teacher goes ONLY to teacher dashboard

      navigate(
        "/teacher-dashboard",
        {
          replace: true
        }
      )

      return
    }


    // =========================================
    // STUDENT LOGIN
    // =========================================

    const accounts =
      JSON.parse(
        localStorage.getItem(
          "tantraAccounts"
        )
      ) || []


    const account =
      accounts.find(
        (item) =>

          item.email &&
          item.email.toLowerCase() ===
            enteredEmail &&

          item.password ===
            enteredPassword
      )


    // =========================================
    // INVALID LOGIN
    // =========================================

    if (!account) {

      setError(
        "Invalid email or password."
      )

      return
    }


    // =========================================
    // CHECK ACCOUNT TYPE
    // =========================================

    if (
      account.accountType !==
      "Student"
    ) {

      setError(
        "This account cannot access the student dashboard."
      )

      return
    }


    // =========================================
    // SAVE STUDENT LOGIN
    // =========================================

    const studentUser = {

      id: account.id,

      name: account.name,

      email: account.email,

      phone: account.phone,

      accountType: "Student"

    }


    localStorage.setItem(
      "tantraLoggedInUser",
      JSON.stringify(studentUser)
    )


    // =========================================
    // SAVE STUDENT PROFILE
    // =========================================

    localStorage.setItem(
      "tantraStudentProfile",
      JSON.stringify({

        name: account.name,

        email: account.email,

        phone: account.phone

      })
    )


    // =========================================
    // REMEMBER EMAIL
    // =========================================

    if (rememberMe) {

      localStorage.setItem(
        "tantraRememberedEmail",
        enteredEmail
      )

    } else {

      localStorage.removeItem(
        "tantraRememberedEmail"
      )

    }


    // =========================================
    // STUDENT DASHBOARD
    // =========================================

    navigate(
      "/student-dashboard",
      {
        replace: true
      }
    )

  }


  return (

    <div className="login-page">

      <div className="login-card">


        {/* LOGO */}

        <div className="login-logo">
          🎵
        </div>


        {/* TITLE */}

        <h1>
          Welcome Back
        </h1>


        <p className="login-subtitle">
          Login to Tantra Academy
        </p>


        {/* ERROR */}

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        {/* FORM */}

        <form onSubmit={handleSubmit}>


          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => {

              setEmail(
                e.target.value
              )

              setError("")

            }}
            placeholder="Enter your email"
            autoComplete="email"
          />


          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => {

              setPassword(
                e.target.value
              )

              setError("")

            }}
            placeholder="Enter your password"
            autoComplete="current-password"
          />


          {/* OPTIONS */}

          <div className="login-options">

            <label className="remember">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              Remember me

            </label>


            <a
              href="#"
              onClick={(e) =>
                e.preventDefault()
              }
            >
              Forgot Password?
            </a>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-submit"
          >
            Login
          </button>

        </form>


        {/* DIVIDER */}

        <div className="login-divider">

          <span>
            OR
          </span>

        </div>


        {/* GOOGLE */}

        <button
          type="button"
          className="google-login"
          onClick={() =>
            alert(
              "Google Login will be connected later."
            )
          }
        >
          Continue with Google
        </button>


        {/* REGISTER */}

        <p className="register-text">

          Don't have an account?

          {" "}

          <Link to="/register">
            Create Account
          </Link>

        </p>

      </div>

    </div>

  )
}

export default Login