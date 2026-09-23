import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  // =========================================
  // LOAD REMEMBERED EMAIL
  // =========================================

  useEffect(() => {

    const rememberedEmail =
      localStorage.getItem(
        "tantraRememberedEmail"
      )

    if (rememberedEmail) {

      setEmail(rememberedEmail)
      setRememberMe(true)

    }

  }, [])


  // =========================================
  // LOGIN
  // =========================================

  async function handleSubmit(e) {

    e.preventDefault()

    setError("")

    const enteredEmail =
      email.trim().toLowerCase()

    const enteredPassword =
      password


    // =========================================
    // VALIDATION
    // =========================================

    if (
      !enteredEmail ||
      !enteredPassword
    ) {

      setError(
        "Please enter your email and password."
      )

      return

    }


    try {

      setLoading(true)


      // =========================================
      // LOGIN API
      // =========================================

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: enteredEmail,
            password: enteredPassword
          })
        }
      )


      // =========================================
      // READ RESPONSE
      // =========================================

      const data =
        await response.json()


      // =========================================
      // LOGIN FAILED
      // =========================================

      if (!response.ok) {

        setError(
          data.message ||
          "Invalid email or password."
        )

        return

      }


      // =========================================
      // GET USER
      // =========================================

      const user =
        data.user


      if (!user) {

        setError(
          "Login response did not contain user information."
        )

        return

      }


      // =========================================
      // GET JWT TOKEN
      // =========================================

      const token =
        data.token


      if (!token) {

        setError(
          "Login successful, but authentication token was not received."
        )

        return

      }


      // =========================================
      // CREATE LOGIN USER
      // =========================================

      const loggedInUser = {

        id:
          user.id,

        name:
          user.name,

        email:
          user.email,

        phone:
          user.phone || "",

        role:
          user.role,

        accountType:
          user.role === "admin"
            ? "Admin"
            : user.role === "teacher"
              ? "Teacher"
              : "Student"

      }


      // =========================================
      // SAVE JWT TOKEN
      // =========================================

      sessionStorage.setItem(
        "tantraAuthToken",
        token
      )


      // =========================================
      // SAVE LOGIN SESSION
      // =========================================
      //
      // sessionStorage is different for each tab.
      // This keeps Student/Admin/Teacher sessions
      // separate between browser tabs.
      //
      // =========================================

      sessionStorage.setItem(
        "tantraLoggedInUser",
        JSON.stringify(loggedInUser)
      )

      sessionStorage.setItem(
        "tantraCurrentUser",
        JSON.stringify(loggedInUser)
      )


      // =========================================
      // REMOVE OLD LOCAL STORAGE LOGIN
      // =========================================

      localStorage.removeItem(
        "tantraLoggedInUser"
      )

      localStorage.removeItem(
        "tantraCurrentUser"
      )


      // =========================================
      // STUDENT PROFILE
      // =========================================

      if (
        user.role === "student"
      ) {

        localStorage.setItem(
          "tantraStudentProfile",
          JSON.stringify({

            name:
              user.name,

            email:
              user.email,

            phone:
              user.phone || ""

          })
        )

      }


      // =========================================
      // TEACHER PROFILE
      // =========================================

      if (
        user.role === "teacher"
      ) {

        let existingTeacherProfile =
          null

        try {

          existingTeacherProfile =
            JSON.parse(
              localStorage.getItem(
                "tantraTeacherProfile"
              )
            )

        } catch (error) {

          existingTeacherProfile =
            null

        }


        if (
          !existingTeacherProfile
        ) {

          localStorage.setItem(
            "tantraTeacherProfile",
            JSON.stringify({

              name:
                user.name,

              role:
                "Music Teacher",

              bio:
                "Passionate about teaching music and helping students discover their musical potential.",

              specialization:
                "Music & Vocal Training",

              instagram:
                "https://www.instagram.com/",

              spotify:
                "",

              facebook:
                "",

              youtube:
                "",

              linkedin:
                ""

            })
          )

        }

      }


      // =========================================
      // REMEMBER EMAIL
      // =========================================

      if (
        rememberMe
      ) {

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
      // ROLE-BASED REDIRECT
      // =========================================

      if (
        user.role === "admin"
      ) {

        navigate(
          "/admin-dashboard",
          {
            replace: true
          }
        )

      } else if (
        user.role === "teacher"
      ) {

        navigate(
          "/teacher-dashboard",
          {
            replace: true
          }
        )

      } else {

        navigate(
          "/student-dashboard",
          {
            replace: true
          }
        )

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      )

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      )

    } finally {

      setLoading(false)

    }

  }


  // =========================================
  // UI
  // =========================================

  return (

    <div className="login-page">

      <div className="login-card">


        {/* =====================================
            LOGO
        ====================================== */}

        <div className="login-logo">
          🎵
        </div>


        {/* =====================================
            TITLE
        ====================================== */}

        <h1>
          Welcome Back
        </h1>

        <p className="login-subtitle">
          Login to Tantra Academy
        </p>


        {/* =====================================
            ERROR
        ====================================== */}

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        {/* =====================================
            FORM
        ====================================== */}

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


          {/* =====================================
              OPTIONS
          ====================================== */}

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


          {/* =====================================
              LOGIN BUTTON
          ====================================== */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* =====================================
            DIVIDER
        ====================================== */}

        <div className="login-divider">

          <span>
            OR
          </span>

        </div>


        {/* =====================================
            GOOGLE
        ====================================== */}

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


        {/* =====================================
            REGISTER
        ====================================== */}

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