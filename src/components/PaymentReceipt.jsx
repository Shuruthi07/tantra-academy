import { useEffect } from "react"

function PaymentReceipt({
  payment,
  onClose
}) {

  if (!payment) {
    return null
  }


  // =====================================================
  // GET LOGGED-IN STUDENT
  // =====================================================

  let student = {}

  try {

    const storedUser =
      sessionStorage.getItem(
        "tantraLoggedInUser"
      )

    if (storedUser) {

      student =
        JSON.parse(
          storedUser
        )

    }

  } catch (error) {

    console.error(
      "Unable to read student information:",
      error
    )

  }


  // =====================================================
  // RECEIPT DATA
  // =====================================================

  const receiptNumber =
    payment.receiptNumber ||
    `TA-${Date.now()
      .toString()
      .slice(-6)}`


  const transactionId =
    payment.transactionId ||
    `TXN-${Date.now()
      .toString()
      .slice(-8)}`


  const studentName =
    payment.studentName ||
    student.name ||
    "Student"


  const studentId =
    payment.studentId ||
    student.id ||
    student._id ||
    "N/A"


  const studentEmail =
    payment.email ||
    student.email ||
    "N/A"


  const amount =
    Number(
      payment.amount || 0
    )


  const paymentType =
    payment.paymentType ||
    payment.type ||
    "Monthly Academy Fee"


  const status =
    payment.status ||
    "Paid"


  const paymentDate =
    payment.paidDate ||
    payment.date ||
    new Date().toISOString()


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(dateValue) {

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
        "en-IN",
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
  // PRINT RECEIPT
  // =====================================================

  function handlePrint() {

    window.setTimeout(() => {

      window.print()

    }, 100)

  }


  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {

    function handleEscape(event) {

      if (
        event.key === "Escape"
      ) {

        onClose()

      }

    }


    document.addEventListener(
      "keydown",
      handleEscape
    )


    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      )

    }

  }, [onClose])


  // =====================================================
  // RECEIPT
  // =====================================================

  return (

    <div
      className="receipt-overlay"
      onClick={onClose}
    >

      <div
        className="payment-receipt"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="receipt-header">

          <div className="receipt-logo">
            🎵
          </div>


          <div>

            <h1>
              Tantra Academy
            </h1>

            <p>
              Music • Learning • Excellence
            </p>

          </div>

        </div>


        {/* =========================================
            RECEIPT TITLE
        ========================================= */}

        <div className="receipt-title">

          <h2>
            PAYMENT RECEIPT
          </h2>

          <span>
            ✓ PAID
          </span>

        </div>


        {/* =========================================
            RECEIPT DETAILS
        ========================================= */}

        <div className="receipt-info">

          <div className="receipt-row">

            <span>
              Receipt No.
            </span>

            <strong>
              {receiptNumber}
            </strong>

          </div>


          <div className="receipt-row">

            <span>
              Transaction ID
            </span>

            <strong>
              {transactionId}
            </strong>

          </div>


          <div className="receipt-row">

            <span>
              Payment Date
            </span>

            <strong>
              {formatDate(
                paymentDate
              )}
            </strong>

          </div>

        </div>


        {/* =========================================
            STUDENT INFORMATION
        ========================================= */}

        <div className="receipt-section">

          <h3>
            Student Information
          </h3>


          <div className="receipt-row">

            <span>
              Student Name
            </span>

            <strong>
              {studentName}
            </strong>

          </div>


          <div className="receipt-row">

            <span>
              Student ID
            </span>

            <strong>
              {studentId}
            </strong>

          </div>


          <div className="receipt-row">

            <span>
              Email
            </span>

            <strong>
              {studentEmail}
            </strong>

          </div>

        </div>


        {/* =========================================
            PAYMENT INFORMATION
        ========================================= */}

        <div className="receipt-section">

          <h3>
            Payment Information
          </h3>


          <div className="receipt-row">

            <span>
              Payment Type
            </span>

            <strong>
              {paymentType}
            </strong>

          </div>


          <div className="receipt-row">

            <span>
              Payment Status
            </span>

            <strong className="paid-status">
              ✓ {status}
            </strong>

          </div>

        </div>


        {/* =========================================
            TOTAL AMOUNT
        ========================================= */}

        <div className="receipt-total">

          <span>
            Total Amount Paid
          </span>

          <strong>
            ₹
            {amount.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>


        {/* =========================================
            FOOTER
        ========================================= */}

        <div className="receipt-footer">

          <p>
            Thank you for choosing
            <strong>
              {" "}Tantra Academy
            </strong>
            {" "}🎶
          </p>

          <small>
            This is a computer-generated
            payment receipt.
          </small>

        </div>


        {/* =========================================
            ACTION BUTTONS
        ========================================= */}

        <div className="receipt-actions">

          <button
            type="button"
            className="receipt-print-btn"
            onClick={handlePrint}
          >
            🖨️ Print Receipt
          </button>


          <button
            type="button"
            className="receipt-close-btn"
            onClick={onClose}
          >
            ✕ Close
          </button>

        </div>

      </div>

    </div>

  )
}

export default PaymentReceipt