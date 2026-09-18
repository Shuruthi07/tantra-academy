import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, allowedRole }) {

  let loggedInUser = null

  try {

    loggedInUser =
      JSON.parse(
        localStorage.getItem("tantraLoggedInUser")
      )

  } catch (error) {

    localStorage.removeItem(
      "tantraLoggedInUser"
    )

  }


  // No user logged in
  if (!loggedInUser) {

    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // Check user role
  if (
    allowedRole &&
    loggedInUser.accountType !== allowedRole
  ) {

    if (
      loggedInUser.accountType === "Teacher"
    ) {

      return (
        <Navigate
          to="/teacher-dashboard"
          replace
        />
      )

    }


    if (
      loggedInUser.accountType === "Student"
    ) {

      return (
        <Navigate
          to="/student-dashboard"
          replace
        />
      )

    }


    // Unknown account type
    localStorage.removeItem(
      "tantraLoggedInUser"
    )

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