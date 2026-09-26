import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/feedback/"


function Feedback() {

  // ==============================
  // FEEDBACK STATE
  // ==============================

  const [feedbackList, setFeedbackList] =
    useState([])

  const [rating, setRating] =
    useState(0)

  const [message, setMessage] =
    useState("")

  const [submitted, setSubmitted] =
    useState(false)

  const [loading, setLoading] =
    useState(true)


  // ==============================
  // JWT AUTH HEADERS
  // ==============================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      Authorization:
        "Bearer " + token
    }
  }


  // ==============================
  // LOAD STUDENT FEEDBACK
  // ==============================

  async function loadFeedback() {

    try {

      setLoading(true)

      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )


      if (!storedUser) {

        setFeedbackList([])

        setLoading(false)

        return

      }


      const loggedInUser =
        JSON.parse(
          storedUser
        )


      const studentId =
        loggedInUser.id


      if (!studentId) {

        setFeedbackList([])

        setLoading(false)

        return

      }


      const response =
        await fetch(
          `${API_URL}?studentId=${studentId}`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        )

      }


      const data =
        await response.json()


      console.log(
        "Feedback API response:",
        data
      )


      if (
        data.success &&
        Array.isArray(data.feedback)
      ) {

        setFeedbackList(
          data.feedback
        )

      } else {

        setFeedbackList([])

      }

    } catch (error) {

      console.error(
        "Feedback loading error:",
        error
      )

      setFeedbackList([])

    } finally {

      setLoading(false)

    }

  }


  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {

    loadFeedback()

  }, [])


  // ==============================
  // SUBMIT FEEDBACK
  // ==============================

  async function submitFeedback() {

    if (rating === 0) {

      alert(
        "Please select a rating ⭐"
      )

      return

    }


    if (!message.trim()) {

      alert(
        "Please write your feedback."
      )

      return

    }


    try {

      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )


      if (!storedUser) {

        alert(
          "Please login again."
        )

        return

      }


      const loggedInUser =
        JSON.parse(
          storedUser
        )


      const studentId =
        loggedInUser.id


      const studentName =
        loggedInUser.name || ""


      if (!studentId) {

        alert(
          "Student account information not found."
        )

        return

      }


      const feedbackData = {

        studentId:
          studentId,

        studentName:
          studentName,

        rating:
          rating,

        message:
          message.trim()

      }


      console.log(
        "Sending feedback:",
        feedbackData
      )


      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            },

            body:
              JSON.stringify(
                feedbackData
              )

          }
        )


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        )

      }


      const data =
        await response.json()


      console.log(
        "Feedback submit response:",
        data
      )


      if (!data.success) {

        alert(
          data.message ||
          "Unable to submit feedback."
        )

        return

      }


      // ==============================
      // RELOAD FROM MONGODB
      // ==============================

      await loadFeedback()


      // ==============================
      // RESET FORM
      // ==============================

      setRating(0)

      setMessage("")

      setSubmitted(true)


      setTimeout(() => {

        setSubmitted(false)

      }, 2500)


    } catch (error) {

      console.error(
        "Feedback submit error:",
        error
      )

      alert(
        "Unable to connect to the server."
      )

    }

  }


  return (

    <div className="feedback-page">


      {/* ==============================
          HEADER
      ============================== */}

      <div className="feedback-header">

        <div>

          <p>
            YOUR VOICE MATTERS
          </p>


          <h1>
            Feedback 💬
          </h1>


          <span>
            Share your experience and help us improve Tantra Academy.
          </span>

        </div>

      </div>


      {/* ==============================
          FEEDBACK FORM
      ============================== */}

      <div className="feedback-form-card">

        <p className="feedback-label">
          SHARE YOUR EXPERIENCE
        </p>


        <h2>
          How was your learning experience?
        </h2>


        {/* STARS */}

        <div className="rating-stars">

          {[1, 2, 3, 4, 5].map(
            (star) => (

              <button
                key={star}
                type="button"
                onClick={() =>
                  setRating(star)
                }
                className={
                  star <= rating
                    ? "star-selected"
                    : "star-empty"
                }
              >
                ★
              </button>

            )
          )}

        </div>


        {/* SELECTED RATING */}

        <p className="selected-rating">

          {rating > 0
            ? `${rating} / 5 stars selected`
            : "Select your rating"}

        </p>


        {/* MESSAGE */}

        <textarea
          placeholder="Write your feedback here..."
          rows="5"
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
        />


        {/* SUCCESS */}

        {submitted && (

          <div className="feedback-success">

            ✓ Feedback submitted successfully!

          </div>

        )}


        {/* SUBMIT */}

        <button
          type="button"
          className="feedback-submit"
          onClick={submitFeedback}
        >
          Submit Feedback
        </button>

      </div>


      {/* ==============================
          PREVIOUS FEEDBACK
      ============================== */}

      <div className="previous-feedback">

        <p className="feedback-label">
          YOUR FEEDBACK
        </p>


        <h2>
          Previous Feedback
        </h2>


        <div className="feedback-list">

          {loading ? (

            <div className="feedback-card">

              <p>
                Loading your feedback...
              </p>

            </div>

          ) : feedbackList.length === 0 ? (

            <div className="feedback-card">

              <p>
                You have not submitted any feedback yet.
              </p>

            </div>

          ) : (

            feedbackList.map(
              (feedback) => (

                <div
                  className="feedback-card"
                  key={feedback.id}
                >

                  {/* TOP */}

                  <div className="feedback-card-top">

                    <div className="feedback-rating">

                      {"★".repeat(
                        feedback.rating
                      )}

                    </div>


                    <span>
                      {feedback.date}
                    </span>

                  </div>


                  {/* MESSAGE */}

                  <p className="feedback-message">

                    "{feedback.message}"

                  </p>


                  {/* TEACHER RESPONSE */}

                  <div className="teacher-response">

                    <strong>
                      🎓 Academy Response
                    </strong>


                    <p>
                      {feedback.response ||
                        "Waiting for academy response..."}

                    </p>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>

  )

}


export default Feedback