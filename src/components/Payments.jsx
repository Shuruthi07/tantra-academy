import { useEffect, useState } from "react"

const defaultPayments = [
  {
    month: "September 2026",
    amount: "₹3,000",
    date: "05 Sep 2026",
    status: "Paid"
  },
  {
    month: "August 2026",
    amount: "₹3,000",
    date: "05 Aug 2026",
    status: "Paid"
  },
  {
    month: "July 2026",
    amount: "₹3,000",
    date: "06 Jul 2026",
    status: "Paid"
  }
]

function Payments() {

  const [fees, setFees] = useState(() => {
    return JSON.parse(
      localStorage.getItem("tantraFees") || "[]"
    )
  })

  const [showPayment, setShowPayment] =
    useState(false)

  function loadFees() {

    const savedFees = JSON.parse(
      localStorage.getItem("tantraFees") || "[]"
    )

    setFees(savedFees)
  }

  useEffect(() => {

    window.addEventListener(
      "feesUpdated",
      loadFees
    )

    window.addEventListener(
      "storage",
      loadFees
    )

    return () => {

      window.removeEventListener(
        "feesUpdated",
        loadFees
      )

      window.removeEventListener(
        "storage",
        loadFees
      )
    }

  }, [])


  // Use teacher fee data if available
  const currentFee =
    fees.length > 0
      ? fees[0]
      : null


  const feeAmount =
    currentFee?.amount || 3000


  const feeStatus =
    currentFee?.status || "Pending"


  const dueDate =
    currentFee?.dueDate || "10 Sep 2026"


  function handlePaymentComplete() {

    if (!currentFee) {

      setShowPayment(false)

      alert(
        "Payment recorded successfully! 🎉"
      )

      return
    }


    const updatedFees = fees.map(
      (fee, index) => {

        if (index === 0) {

          return {
            ...fee,
            status: "Paid",
            paidDate:
              new Date().toLocaleDateString()
          }

        }

        return fee
      }
    )


    localStorage.setItem(
      "tantraFees",
      JSON.stringify(updatedFees)
    )


    setFees(updatedFees)


    window.dispatchEvent(
      new Event("feesUpdated")
    )


    // Notify teacher
    const teacherNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        ) || "[]"
      )


    const newNotification = {

      id: Date.now(),

      icon: "💳",

      title: "Fee payment received",

      message:
        "A student has marked the monthly fee as paid.",

      type: "Fee",

      time: "Just now",

      unread: true
    }


    localStorage.setItem(
      "tantraTeacherNotifications",
      JSON.stringify([
        newNotification,
        ...teacherNotifications
      ])
    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
    )


    setShowPayment(false)


    alert(
      "Payment marked as paid successfully! 🎉"
    )
  }


  return (

    <div className="payments-page">

      {/* HEADER */}

      <div className="payments-header">

        <div>

          <p>MY PAYMENTS</p>

          <h1>
            Payments 💳
          </h1>

          <span>
            Manage your academy fees and payment history.
          </span>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="payment-summary">

        <div className="payment-summary-card">

          <span>
            Current Fee
          </span>

          <h2>
            ₹{Number(feeAmount).toLocaleString()}
          </h2>

          <p>
            September 2026
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


      {/* CURRENT PAYMENT */}

      <div className="payment-current">

        <div>

          <p className="payment-label">
            CURRENT PAYMENT
          </p>

          <h2>
            September 2026 Fee
          </h2>

          <p>
            Monthly academy fee · ₹
            {Number(feeAmount).toLocaleString()}
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


          {feeStatus === "Pending" && (

            <button
              onClick={() =>
                setShowPayment(true)
              }
              className="pay-now-btn"
            >
              💳 Pay Now
            </button>

          )}


          {feeStatus === "Paid" && (

            <button
              onClick={() =>
                alert(
                  "Receipt feature will be available soon. 📄"
                )
              }
            >
              View Receipt
            </button>

          )}

        </div>

      </div>


      {/* PAYMENT HISTORY */}

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

          {defaultPayments.map(
            (payment) => (

              <div
                className="payment-row"
                key={payment.month}
              >

                <div className="payment-icon">
                  💳
                </div>


                <div className="payment-info">

                  <h3>
                    {payment.month}
                  </h3>

                  <p>
                    Paid on {payment.date}
                  </p>

                </div>


                <strong>
                  {payment.amount}
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

              </div>

            )
          )}

        </div>

      </div>


      {/* QR PAYMENT MODAL */}

      {showPayment && (

        <div
          className="payment-qr-overlay"
          onClick={() =>
            setShowPayment(false)
          }
        >

          <div
            className="payment-qr-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
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
                src="\public/upi-qr.jpeg"
                alt="Academy UPI Payment QR Code"
              />

            </div>


            {/* AMOUNT */}

            <div className="payment-amount-box">

              <span>
                Amount to Pay
              </span>

              <strong>
                ₹{Number(feeAmount).toLocaleString()}
              </strong>

            </div>


            <p className="payment-qr-note">
              📱 Open Google Pay, PhonePe, Paytm
              or another UPI app and scan the QR.
            </p>


            <button
              className="payment-complete-btn"
              onClick={handlePaymentComplete}
            >
              ✓ I've Paid
            </button>


            <button
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

    </div>
  )
}

export default Payments