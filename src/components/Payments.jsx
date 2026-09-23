import { useEffect, useState } from "react"
import PaymentReceipt from "./PaymentReceipt"


const FEES_API =
  "http://127.0.0.1:5000/api/fees"


function Payments() {

  const [fees, setFees] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [showPayment, setShowPayment] =
    useState(false)

  const [showReceipt, setShowReceipt] =
    useState(false)

  const [selectedPayment, setSelectedPayment] =
    useState(null)


  // =====================================================
  // JWT AUTH HEADERS
  // =====================================================

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


  // =====================================================
  // GET LOGGED-IN STUDENT
  // =====================================================

  function getLoggedInStudent() {

    try {

      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )


      if (!storedUser) {
        return null
      }


      return JSON.parse(
        storedUser
      )

    } catch (error) {

      console.error(
        "Unable to read logged-in student:",
        error
      )

      return null
    }
  }


  // =====================================================
  // LOAD FEES FROM MONGODB
  // =====================================================

  async function loadFees() {

    try {

      setLoading(true)
      setError("")


      const student =
        getLoggedInStudent()


      if (!student) {

        setError(
          "Student login information not found."
        )

        setFees([])

        return
      }


      const studentId =
        student.id ||
        student._id


      if (!studentId) {

        setError(
          "Student ID not found."
        )

        setFees([])

        return
      }


      const response =
        await fetch(
          `${FEES_API}?studentId=${encodeURIComponent(
            studentId
          )}`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            },

            cache: "no-store"
          }
        )


      const data =
        await response.json()


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Unable to load fees."
        )
      }


      setFees(
        Array.isArray(data.fees)
          ? data.fees
          : []
      )

    } catch (error) {

      console.error(
        "Fee loading error:",
        error
      )

      setError(
        error.message ||
        "Unable to load payment details."
      )

      setFees([])

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    loadFees()

  }, [])


  // =====================================================
  // CURRENT FEE
  // =====================================================

  const currentFee =
    fees.length > 0
      ? fees[0]
      : null


  const feeAmount =
    currentFee?.amount || 0


  const feeStatus =
    currentFee?.status || "Pending"


  const dueDate =
    currentFee?.dueDate || "-"


  const currentMonth =
    currentFee?.month ||
    "No current fee"


  // =====================================================
  // PAYMENT
  // =====================================================

  async function handlePaymentComplete() {

    if (!currentFee?.id) {

      alert(
        "No pending fee is available."
      )

      return
    }


    try {

      const response =
        await fetch(
          `${FEES_API}/${currentFee.id}/pay`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders()
            }
          }
        )


      const data =
        await response.json()


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Payment could not be recorded."
        )
      }


      setShowPayment(false)


      await loadFees()


      window.dispatchEvent(
        new Event("feesUpdated")
      )


      window.dispatchEvent(
        new Event("notificationsUpdated")
      )


      alert(
        "Payment marked as paid successfully! 🎉"
      )

    } catch (error) {

      console.error(
        "Payment error:",
        error
      )

      alert(
        error.message ||
        "Unable to record payment."
      )

    }

  }


  // =====================================================
  // OPEN RECEIPT
  // =====================================================

  function handleViewReceipt(
    payment
  ) {

    if (!payment) {
      return
    }


    setSelectedPayment({

      ...payment,

      paymentType:
        "Monthly Academy Fee",

      status:
        payment.status || "Paid",

      paidDate:
        payment.paidDate ||
        new Date().toISOString(),

      receiptNumber:
        payment.receiptNumber ||
        `TA-${Date.now()
          .toString()
          .slice(-6)}`,

      transactionId:
        payment.transactionId ||
        `TXN-${Date.now()
          .toString()
          .slice(-8)}`

    })


    setShowReceipt(true)

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    dateValue
  ) {

    if (!dateValue) {
      return "-"
    }


    try {

      const date =
        new Date(dateValue)


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return dateValue

      }


      return date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )

    } catch {

      return dateValue

    }

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="payments-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="payments-header">

        <div>

          <p>
            MY PAYMENTS
          </p>

          <h1>
            Payments 💳
          </h1>

          <span>
            Manage your academy fees and payment history.
          </span>

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="payment-loading">

          Loading payment details...

        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div className="payment-error">

          {error}

        </div>

      )}


      {/* =================================================
          NO FEES
      ================================================= */}

      {!loading &&
        !error &&
        fees.length === 0 && (

          <div className="payment-empty">

            <div>
              💳
            </div>

            <h2>
              No payment records yet
            </h2>

            <p>
              Your academy fee will appear here
              when it is assigned to you.
            </p>

          </div>

        )}


      {/* =================================================
          PAYMENT CONTENT
      ================================================= */}

      {!loading &&
        fees.length > 0 && (

          <>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="payment-summary">

              <div className="payment-summary-card">

                <span>
                  Current Fee
                </span>

                <h2>
                  ₹
                  {Number(
                    feeAmount
                  ).toLocaleString()}
                </h2>

                <p>
                  {currentMonth}
                </p>

              </div>


              <div className="payment-summary-card">

                <span>
                  Due Date
                </span>

                <h2>
                  {dueDate}
                </h2>

                <p>
                  Payment deadline
                </p>

              </div>


              <div className="payment-summary-card">

                <span>
                  Status
                </span>

                <h2
                  className={
                    feeStatus === "Paid"
                      ? "paid-status"
                      : "pending-status"
                  }
                >

                  {feeStatus === "Paid"
                    ? "Paid ✓"
                    : "Pending"}

                </h2>

                <p>

                  {feeStatus === "Paid"
                    ? "Payment successful"
                    : "Payment is pending"}

                </p>

              </div>

            </div>


            {/* =================================================
                CURRENT PAYMENT
            ================================================= */}

            <div className="payment-current">

              <div>

                <p className="payment-label">
                  CURRENT PAYMENT
                </p>

                <h2>
                  {currentMonth} Fee
                </h2>

                <p>
                  Monthly academy fee · ₹
                  {Number(
                    feeAmount
                  ).toLocaleString()}
                </p>

              </div>


              <div className="payment-action">

                <span
                  className={
                    feeStatus === "Paid"
                      ? "payment-paid"
                      : "payment-pending"
                  }
                >

                  {feeStatus === "Paid"
                    ? "Paid ✓"
                    : "Pending"}

                </span>


                {/* PAY NOW */}

                {feeStatus === "Pending" && (

                  <button
                    type="button"
                    onClick={() =>
                      setShowPayment(true)
                    }
                    className="pay-now-btn"
                  >

                    💳 Pay Now

                  </button>

                )}


                {/* VIEW RECEIPT */}

                {feeStatus === "Paid" && (

                  <button
                    type="button"
                    className="view-receipt-btn"
                    onClick={() =>
                      handleViewReceipt(
                        currentFee
                      )
                    }
                  >

                    🧾 View Receipt

                  </button>

                )}

              </div>

            </div>


            {/* =================================================
                PAYMENT HISTORY
            ================================================= */}

            <div className="payment-history">

              <div className="history-heading">

                <div>

                  <p>
                    PAYMENT RECORDS
                  </p>

                  <h2>
                    Payment History
                  </h2>

                </div>

              </div>


              <div className="payment-list">

                {fees.map(
                  (payment) => (

                    <div
                      className="payment-row"
                      key={payment.id}
                    >

                      <div className="payment-icon">
                        💳
                      </div>


                      <div className="payment-info">

                        <h3>
                          {payment.month}
                        </h3>

                        <p>

                          {payment.status === "Paid"

                            ? `Paid on ${formatDate(
                                payment.paidDate
                              )}`

                            : `Due on ${
                                payment.dueDate ||
                                "-"
                              }`

                          }

                        </p>

                      </div>


                      <strong>

                        ₹
                        {Number(
                          payment.amount || 0
                        ).toLocaleString()}

                      </strong>


                      <span
                        className={
                          payment.status === "Paid"
                            ? "payment-status"
                            : "payment-status pending"
                        }
                      >

                        {payment.status}

                      </span>


                      {/* HISTORY RECEIPT */}

                      {payment.status === "Paid" && (

                        <button
                          type="button"
                          className="history-receipt-btn"
                          onClick={() =>
                            handleViewReceipt(
                              payment
                            )
                          }
                          title="View receipt"
                        >

                          🧾

                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            </div>

          </>

        )}


      {/* =================================================
          QR PAYMENT MODAL
      ================================================= */}

      {showPayment && currentFee && (

        <div
          className="payment-qr-overlay"
          onClick={() =>
            setShowPayment(false)
          }
        >

          <div
            className="payment-qr-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="payment-qr-close"
              onClick={() =>
                setShowPayment(false)
              }
            >

              ✕

            </button>


            <p className="payment-qr-label">
              SECURE PAYMENT
            </p>


            <h2>
              Pay Your Academy Fee 💳
            </h2>


            <p className="payment-qr-description">

              Scan the QR code using any UPI app
              to make your payment.

            </p>


            {/* QR CODE */}

            <div className="payment-qr-box">

              <img
                src="/upi-qr.jpeg"
                alt="Academy UPI Payment QR Code"
              />

            </div>


            {/* AMOUNT */}

            <div className="payment-amount-box">

              <span>
                Amount to Pay
              </span>

              <strong>
                ₹
                {Number(
                  feeAmount
                ).toLocaleString()}
              </strong>

            </div>


            <p className="payment-qr-note">

              📱 Open Google Pay, PhonePe, Paytm
              or another UPI app and scan the QR.

            </p>


            <button
              type="button"
              className="payment-complete-btn"
              onClick={
                handlePaymentComplete
              }
            >

              ✓ I've Paid

            </button>


            <button
              type="button"
              className="payment-cancel-btn"
              onClick={() =>
                setShowPayment(false)
              }
            >

              Cancel

            </button>

          </div>

        </div>

      )}


      {/* =================================================
          PAYMENT RECEIPT
      ================================================= */}

      {showReceipt &&
        selectedPayment && (

          <PaymentReceipt
            payment={
              selectedPayment
            }

            onClose={() => {

              setShowReceipt(
                false
              )

              setSelectedPayment(
                null
              )

            }}
          />

        )}

    </div>

  )

}


export default Payments