import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function TeacherFeedback() {

  // ==============================
  // FEEDBACK STATE
  // ==============================

  const [feedbackList, setFeedbackList] =
    useState(() =>
      JSON.parse(
        localStorage.getItem("tantraFeedback")
      ) || []
    )

  const [responses, setResponses] =
    useState({})


  // ==============================
  // LOAD LIVE FEEDBACK
  // ==============================

  useEffect(() => {

    function loadFeedback() {

      const savedFeedback =
        JSON.parse(
          localStorage.getItem("tantraFeedback")
        ) || []

      setFeedbackList(savedFeedback)

    }

    loadFeedback()

    window.addEventListener(
      "storage",
      loadFeedback
    )

    window.addEventListener(
      "feedbackUpdated",
      loadFeedback
    )

    return () => {

      window.removeEventListener(
        "storage",
        loadFeedback
      )

      window.removeEventListener(
        "feedbackUpdated",
        loadFeedback
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

    setResponses((previous) => ({
      ...previous,
      [id]: value
    }))

  }


  // ==============================
  // SEND RESPONSE
  // ==============================

  function submitResponse(id) {

    const responseText =
      responses[id] || ""

    if (!responseText.trim()) {

      alert(
        "Please write a response."
      )

      return

    }


    const updatedFeedback =
      feedbackList.map(
        (feedback) => {

          if (
            String(feedback.id) ===
            String(id)
          ) {

            return {
              ...feedback,
              response:
                responseText.trim()
            }

          }

          return feedback

        }
      )


    // ==============================
    // SAVE FEEDBACK
    // ==============================

    localStorage.setItem(
      "tantraFeedback",
      JSON.stringify(
        updatedFeedback
      )
    )


    setFeedbackList(
      updatedFeedback
    )


    window.dispatchEvent(
      new Event("feedbackUpdated")
    )


    // ==============================
    // STUDENT NOTIFICATION
    // ==============================

    const studentNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraNotifications"
        ) || "[]"
      )


    const newNotification = {

      id:
        Date.now() +
        Math.floor(
          Math.random() * 1000
        ),

      icon:
        "💬",

      title:
        "Teacher responded to your feedback",

      message:
        "Your teacher has responded to your feedback.",

      type:
        "Feedback",

      time:
        "Just now",

      unread:
        true

    }


    localStorage.setItem(
      "tantraNotifications",
      JSON.stringify([
        newNotification,
        ...studentNotifications
      ])
    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
    )


    // ==============================
    // CLEAR RESPONSE BOX
    // ==============================

    setResponses(
      (previous) => {

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

  }


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

        {feedbackList.length === 0 ? (

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
            (feedback) => {

              const rating =
                Math.min(
                  5,
                  Math.max(
                    0,
                    Number(feedback.rating) || 0
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
                        Student Feedback
                      </h3>

                      <div className="teacher-feedback-rating">

                        {"★".repeat(rating)}

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
                          onChange={(e) =>
                            handleResponseChange(
                              feedback.id,
                              e.target.value
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