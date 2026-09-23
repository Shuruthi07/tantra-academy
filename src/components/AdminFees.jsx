import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminFees() {

  const navigate = useNavigate()

  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const API_URL =
    "http://127.0.0.1:5000/api/fees"

  // ==========================================
  // JWT AUTH HEADERS
  // ==========================================

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

  // ==========================================
  // LOAD FEES
  // ==========================================

  async function loadFees() {

    try {

      setLoading(true)
      setError("")

      const response =
        await fetch(
          API_URL,
          {
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {

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
        "Admin fees error:",
        error
      )

      setError(
        error.message ||
        "Unable to load fee records."
      )

      setFees([])

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    loadFees()

  }, [])

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(value) {

    if (!value) {
      return "-"
    }

    try {

      const date =
        new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return value

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

      return value

    }

  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalFees =
    fees.reduce(
      (total, fee) =>
        total +
        Number(
          fee.amount || 0
        ),
      0
    )

  const paidFees =
    fees
      .filter(
        (fee) =>
          fee.status === "Paid"
      )
      .reduce(
        (total, fee) =>
          total +
          Number(
            fee.amount || 0
          ),
        0
      )

  const pendingFees =
    fees
      .filter(
        (fee) =>
          fee.status !== "Paid"
      )
      .reduce(
        (total, fee) =>
          total +
          Number(
            fee.amount || 0
          ),
        0
      )

  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="admin-dashboard">

      {/* HEADER */}

      <div className="admin-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Fee Management 💰
          </h1>

          <span>
            View and monitor academy fee payments.
          </span>

        </div>

        <button
          className="admin-back-btn"
          onClick={() =>
            navigate(
              "/admin-dashboard"
            )
          }
        >
          ← Dashboard
        </button>

      </div>

      {/* STATISTICS */}

      <div className="admin-stats">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💰
          </div>

          <div>

            <p>
              Total Fees
            </p>

            <h2>
              ₹
              {totalFees.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ✅
          </div>

          <div>

            <p>
              Paid
            </p>

            <h2>
              ₹
              {paidFees.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⏳
          </div>

          <div>

            <p>
              Pending
            </p>

            <h2>
              ₹
              {pendingFees.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🧾
          </div>

          <div>

            <p>
              Records
            </p>

            <h2>
              {fees.length}
            </h2>

          </div>

        </div>

      </div>

      {/* FEE RECORDS */}

      <div className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p>
              PAYMENT RECORDS
            </p>

            <h2>
              Student Fees
            </h2>

          </div>

          <button
            className="admin-back-btn"
            onClick={loadFees}
          >
            🔄 Refresh
          </button>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="payment-loading">
            Loading fee records...
          </div>

        )}

        {/* ERROR */}

        {!loading && error && (

          <div className="payment-error">
            {error}
          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          fees.length === 0 && (

            <div className="payment-empty">

              <div>
                💰
              </div>

              <h2>
                No fee records
              </h2>

              <p>
                Student fee records will appear here.
              </p>

            </div>

          )}

        {/* TABLE */}

        {!loading &&
          !error &&
          fees.length > 0 && (

            <div className="admin-fees-table-wrapper">

              <table className="admin-fees-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Month
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Due Date
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Paid Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {fees.map(
                    (fee) => (

                      <tr
                        key={fee.id}
                      >

                        <td>

                          <strong>
                            {fee.studentName ||
                              "Student"}
                          </strong>

                          <small>
                            {fee.studentId ||
                              "-"}
                          </small>

                        </td>

                        <td>
                          {fee.month ||
                            "-"}
                        </td>

                        <td>

                          <strong>
                            ₹
                            {Number(
                              fee.amount || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </td>

                        <td>
                          {formatDate(
                            fee.dueDate
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              fee.status ===
                              "Paid"
                                ? "admin-fee-paid"
                                : "admin-fee-pending"
                            }
                          >

                            {fee.status ===
                            "Paid"
                              ? "✓ Paid"
                              : "⏳ Pending"}

                          </span>

                        </td>

                        <td>

                          {fee.status ===
                          "Paid"
                            ? formatDate(
                                fee.paidDate
                              )
                            : "-"}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>

  )
}

export default AdminFees