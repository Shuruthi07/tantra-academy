import { useEffect, useState } from "react"

const defaultFeedback = [
  {
    id: 1,
    rating: 5,
    message: "The vocal training sessions are very helpful!",
    date: "02 Sep 2026",
    response: "Thank you for your feedback!"
  },
  {
    id: 2,
    rating: 4,
    message: "The practice sessions are well organised.",
    date: "20 Aug 2026",
    response: "We're glad you're enjoying the sessions."
  }
]


function Feedback() {

  // ==============================
  // FEEDBACK STATE
  // ==============================

  const [feedbackList, setFeedbackList] =
    useState(() => {

      const saved =
        JSON.parse(
          localStorage.getItem("tantraFeedback")
        )

      return saved || defaultFeedback

    })


  const [rating, setRating] =
    useState(0)


  const [message, setMessage] =
    useState("")


  const [submitted, setSubmitted] =
    useState(false)



  // ==============================
  // LIVE FEEDBACK SYNC
  // ==============================

  useEffect(() => {

    function loadFeedback() {

      const saved =
        JSON.parse(
          localStorage.getItem("tantraFeedback")
        ) || defaultFeedback


      setFeedbackList(saved)

    }


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
  // SUBMIT FEEDBACK
  // ==============================

  function submitFeedback() {

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


    const newFeedback = {

      id: Date.now(),

      rating: rating,

      message: message.trim(),

      date:
        new Date().toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        ),

      response:
        "Waiting for academy response..."

    }



    const updatedFeedback = [

      newFeedback,

      ...feedbackList

    ]



    // Save feedback

    localStorage.setItem(
      "tantraFeedback",
      JSON.stringify(
        updatedFeedback
      )
    )



    setFeedbackList(
      updatedFeedback
    )



    // Tell Teacher Feedback page

    window.dispatchEvent(
      new Event("feedbackUpdated")
    )



    // ==============================
    // TEACHER NOTIFICATION
    // ==============================

    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []


    teacherNotifications.unshift({

      id: Date.now() + 1,

      icon: "💬",

      title:
        "New student feedback",

      message:
        `A student submitted a ${rating}/5 feedback.`,

      type: "Feedback",

      time: "Just now",

      unread: true

    })



    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify(
        teacherNotifications
      )
    )



    window.dispatchEvent(
      new Event(
        "notificationsUpdated"
      )
    )



    // Reset form

    setRating(0)

    setMessage("")

    setSubmitted(true)



    setTimeout(() => {

      setSubmitted(false)

    }, 2500)

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
            setMessage(e.target.value)
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

          {feedbackList.map(
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
                    {feedback.response}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>

  )

}


export default Feedback