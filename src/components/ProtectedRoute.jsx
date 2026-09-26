import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

function ProtectedRoute({
  children,
  allowedRole
}) {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function verifyAuthentication() {
      const token =
        sessionStorage.getItem("tantraAuthToken")

      if (!token) {
        setUser(null)
        setChecking(false)
        return
      }

      try {
        const response = await fetch(
          "https://tantra-academy-1.onrender.com/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json"
            },
            cache: "no-store"
          }
        )

        const data = await response.json()

        console.log(
          "ProtectedRoute /me:",
          data
        )

        if (
          !response.ok ||
          !data.success ||
          !data.user
        ) {
          sessionStorage.removeItem(
            "tantraAuthToken"
          )

          sessionStorage.removeItem(
            "tantraLoggedInUser"
          )

          sessionStorage.removeItem(
            "tantraCurrentUser"
          )

          setUser(null)
          setChecking(false)
          return
        }

        const backendUser = data.user

        const role = String(
          backendUser.role ||
          backendUser.accountType ||
          ""
        )
          .trim()
          .toLowerCase()

        const verifiedUser = {
          ...backendUser,
          role
        }

        console.log(
          "VERIFIED USER:",
          verifiedUser
        )

        console.log(
          "VERIFIED ROLE:",
          role
        )

        sessionStorage.setItem(
          "tantraLoggedInUser",
          JSON.stringify(
            verifiedUser
          )
        )

        sessionStorage.setItem(
          "tantraCurrentUser",
          JSON.stringify(
            verifiedUser
          )
        )

        setUser(verifiedUser)

      } catch (error) {
        console.error(
          "Authentication verification error:",
          error
        )

        setUser(null)

      } finally {
        setChecking(false)
      }
    }

    verifyAuthentication()
  }, [])

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6a1b9a",
          fontSize: "18px",
          fontWeight: "600"
        }}
      >
        Checking authentication...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const currentRole =
    String(
      user.role ||
      user.accountType ||
      ""
    )
      .trim()
      .toLowerCase()

  const requiredRole =
    String(
      allowedRole || ""
    )
      .trim()
      .toLowerCase()

  console.log(
    "Protected Route:",
    {
      currentRole,
      requiredRole,
      path: window.location.pathname
    }
  )

  /*
   * ROLE CHECK
   */

  if (
    requiredRole &&
    currentRole !== requiredRole
  ) {

    if (
      currentRole === "student"
    ) {
      return (
        <Navigate
          to="/student-dashboard"
          replace
        />
      )
    }

    if (
      currentRole === "teacher"
    ) {
      return (
        <Navigate
          to="/teacher-dashboard"
          replace
        />
      )
    }

    if (
      currentRole === "admin"
    ) {
      return (
        <Navigate
          to="/admin-dashboard"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute