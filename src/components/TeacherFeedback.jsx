import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


const API_URL =
  "https://tantra-academy-1.onrender.com/api/feedback/"

const NOTIFICATION_API =
  "https://tantra-academy-1.onrender.com/api/notifications/"


function TeacherFeedback() {

  // ==============================
  // FEEDBACK STATE
  // ==============================

  const [feedbackList, setFeedbackList] =
    useState([])

  const [responses, setResponses] =
    useState({})

  const [loading, setLoading] =
    useState(true)


  // ==============================
  // JWT HEADERS
  // ==============================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      "Content-Type": "application/json",

      Authorization:
        `Bearer ${token}`
    }
  }


  // ==============================
  // LOAD FEEDBACK FROM MONGODB
  // ==============================

  async function loadFeedback() {

    try {

      setLoading(true)


      const response =
        await fetch(
          API_URL,
          {
            method: "GET",

            headers:
              getAuthHeaders(),

            cache: "no-store"
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
        "Teacher Feedback:",
        data
      )


      if (
        data.success &&
        Array.isArray(
          data.feedback
        )
      ) {

        setFeedbackList(
          data.feedback
        )

      } else {

        setFeedbackList([])

      }

    } catch (error) {

      console.error(
        "Teacher feedback loading error:",
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


    function handleFeedbackUpdated() {

      loadFeedback()

    }


    window.addEventListener(
      "feedbackUpdated",
      handleFeedbackUpdated
    )


    return () => {

      window.removeEventListener(
        "feedbackUpdated",
        handleFeedbackUpdated
      )

    }

  }, [])


  // ==============================
  // RESPONSE INPUT
  // ==============================

  function handleResponseChange(
    id,
    value
  ) {

    setResponses(
      previous => ({

        ...previous,

        [id]:
          value

      })
    )

  }


  // ==============================
  // SEND RESPONSE
  // ==============================

  async function submitResponse(
    id
  ) {

    const responseText =
      responses[id] || ""


    if (
      !responseText.trim()
    ) {

      alert(
        "Please write a response."
      )

      return

    }


    try {

      // =================================
      // UPDATE FEEDBACK IN MONGODB
      // =================================

      const response =
        await fetch(
          `${API_URL}${id}/response`,
          {
            method: "PUT",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                response:
                  responseText.trim()

              })

          }
        )


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        )

      }


      const data =
        await response.json()


      if (!data.success) {

        alert(
          data.message ||
          "Unable to save response."
        )

        return

      }


      // =================================
      // FIND STUDENT
      // =================================

      const selectedFeedback =
        feedbackList.find(
          feedback =>
            String(
              feedback.id
            ) ===
            String(id)
        )


      // =================================
      // STUDENT NOTIFICATION
      // =================================

      if (
        selectedFeedback &&
        selectedFeedback.studentId
      ) {

        try {

          await fetch(
            NOTIFICATION_API,
            {
              method: "POST",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({

                  userId:
                    selectedFeedback.studentId,

                  title:
                    "Teacher responded to your feedback",

                  message:
                    "Your teacher has responded to your feedback.",

                  type:
                    "Feedback"

                })

            }
          )

        } catch (
          notificationError
        ) {

          console.error(
            "Student notification error:",
            notificationError
          )

        }

      }


      // =================================
      // RELOAD FEEDBACK
      // =================================

      await loadFeedback()


      // =================================
      // CLEAR RESPONSE BOX
      // =================================

      setResponses(
        previous => {

          const updated = {
            ...previous
          }

          delete updated[id]

          return updated

        }
      )


      alert(
        "Response sent successfully! ✅"
      )


      window.dispatchEvent(
        new Event(
          "feedbackUpdated"
        )
      )


    } catch (error) {

      console.error(
        "Teacher response error:",
        error
      )

      alert(
        "Unable to connect to the server."
      )

    }

  }


  // ==============================
  // PAGE
  // ==============================

  return (

    <div className="teacher-feedback-page">


      {/* ==============================
          HEADER
      ============================== */}

      <div className="teacher-feedback-header">

        <div>

          <p>
            STUDENT FEEDBACK
          </p>

          <h1>
            Feedback 💬
          </h1>

          <span>
            View student feedback and respond to their experience.
          </span>

        </div>

      </div>


      {/* ==============================
          BACK TO DASHBOARD
      ============================== */}

      <Link
        to="/teacher-dashboard"
        className="teacher-feedback-back"
      >
        Back to Dashboard
      </Link>


      {/* ==============================
          FEEDBACK LIST
      ============================== */}

      <div className="teacher-feedback-list">

        {loading ? (

          <div className="no-feedback">

            <div className="no-feedback-icon">
              ⏳
            </div>

            <h2>
              Loading feedback...
            </h2>

            <p>
              Please wait while student feedback is loaded.
            </p>

          </div>

        ) : feedbackList.length === 0 ? (

          <div className="no-feedback">

            <div className="no-feedback-icon">
              💬
            </div>

            <h2>
              No feedback yet
            </h2>

            <p>
              Student feedback will appear here.
            </p>

          </div>

        ) : (

          feedbackList.map(
            feedback => {

              const rating =
                Math.min(
                  5,
                  Math.max(
                    0,
                    Number(
                      feedback.rating
                    ) || 0
                  )
                )


              const hasResponse =
                feedback.response &&
                feedback.response.trim() &&
                feedback.response !==
                  "Waiting for academy response..."


              return (

                <div
                  className="teacher-feedback-card"
                  key={feedback.id}
                >


                  {/* ==============================
                      FEEDBACK HEADER
                  ============================== */}

                  <div className="teacher-feedback-top">

                    <div>

                      <h3>

                        {feedback.studentName
                          ? feedback.studentName
                          : "Student Feedback"}

                      </h3>


                      <div className="teacher-feedback-rating">

                        {"★".repeat(
                          rating
                        )}

                        {"☆".repeat(
                          5 - rating
                        )}

                      </div>

                    </div>


                    <span>

                      {feedback.date ||
                        "Date not available"}

                    </span>

                  </div>


                  {/* ==============================
                      STUDENT MESSAGE
                  ============================== */}

                  <div className="teacher-feedback-message">

                    <strong>
                      Student's Message
                    </strong>

                    <p>

                      "{feedback.message ||
                        "No message provided."}"

                    </p>

                  </div>


                  {/* ==============================
                      TEACHER RESPONSE
                  ============================== */}

                  <div className="teacher-response-section">

                    <strong>
                      🎓 Your Response
                    </strong>


                    {hasResponse ? (

                      <div className="existing-response">

                        {feedback.response}

                      </div>

                    ) : (

                      <>

                        <textarea
                          rows="3"
                          placeholder="Write your response to the student..."
                          value={
                            responses[
                              feedback.id
                            ] || ""
                          }
                          onChange={
                            event =>
                              handleResponseChange(
                                feedback.id,
                                event.target.value
                              )
                          }
                        />


                        <button
                          type="button"
                          className="teacher-response-btn"
                          onClick={() =>
                            submitResponse(
                              feedback.id
                            )
                          }
                        >
                          Send Response
                        </button>

                      </>

                    )}

                  </div>

                </div>

              )

            }
          )

        )}

      </div>

    </div>

  )

}


export default TeacherFeedback