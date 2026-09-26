import { useEffect, useMemo, useState } from "react"
import {
  Link,
  useSearchParams
} from "react-router-dom"


const STUDENTS_API =
  "https://tantra-academy-1.onrender.com/api/admin/teacher-students"

const FEES_API =
  "https://tantra-academy-1.onrender.com/api/fees/"

const NOTIFICATIONS_API =
  "https://tantra-academy-1.onrender.com/api/notifications"


function TeacherFees() {

  const [searchParams, setSearchParams] =
    useSearchParams()

  const selectedStudentId =
    searchParams.get("studentId") || ""


  const [students, setStudents] =
    useState([])

  const [fees, setFees] =
    useState([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [showCreateFee, setShowCreateFee] =
    useState(false)

  // Used only for the Assign Fee modal
  const [selectedStudent, setSelectedStudent] =
    useState(null)

  const [amount, setAmount] =
    useState("3000")

  const [month, setMonth] =
    useState("September 2026")

  const [dueDate, setDueDate] =
    useState("10 Sep 2026")

  const [creatingFee, setCreatingFee] =
    useState(false)


  // =====================================================
  // JWT HEADERS
  // =====================================================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      "Content-Type":
        "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})
    }
  }


  // =====================================================
  // LOAD STUDENTS AND FEES
  // =====================================================

  async function loadData() {

    try {

      setLoading(true)
      setError("")


      const [
        studentsResponse,
        feesResponse
      ] = await Promise.all([

        fetch(
          STUDENTS_API,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        ),

        fetch(
          FEES_API,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      ])


      const studentsData =
        await studentsResponse.json()

      const feesData =
        await feesResponse.json()


      if (
        !studentsResponse.ok ||
        !studentsData.success
      ) {

        throw new Error(
          studentsData.message ||
          "Unable to load students."
        )

      }


      if (
        !feesResponse.ok ||
        !feesData.success
      ) {

        throw new Error(
          feesData.message ||
          "Unable to load fees."
        )

      }


      setStudents(
        Array.isArray(
          studentsData.students
        )
          ? studentsData.students
          : []
      )


      setFees(
        Array.isArray(
          feesData.fees
        )
          ? feesData.fees
          : []
      )


    } catch (error) {

      console.error(
        "Teacher fees loading error:",
        error
      )

      setError(
        error.message ||
        "Unable to load fee information."
      )

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadData()


    function handleFeesUpdated() {
      loadData()
    }


    window.addEventListener(
      "feesUpdated",
      handleFeesUpdated
    )


    return () => {

      window.removeEventListener(
        "feesUpdated",
        handleFeesUpdated
      )

    }

  }, [selectedStudentId])


  // =====================================================
  // STUDENT FROM URL
  // =====================================================

  const selectedStudentFromUrl =
    useMemo(() => {

      if (!selectedStudentId) {
        return null
      }

      return students.find(
        student =>
          String(
            student.id ||
            student._id
          ) ===
          String(
            selectedStudentId
          )
      ) || null

    }, [
      students,
      selectedStudentId
    ])


  // =====================================================
  // GET STUDENT FEE
  // =====================================================

  function getStudentFee(
    studentId
  ) {

    const studentFees =
      fees.filter(
        fee =>
          String(
            fee.studentId
          ) ===
          String(
            studentId
          )
      )


    if (
      studentFees.length === 0
    ) {

      return null

    }


    return studentFees[0]

  }


  // =====================================================
  // OPEN CREATE FEE
  // =====================================================

  function openCreateFee(
    student
  ) {

    setSelectedStudent(
      student
    )

    setAmount(
      "3000"
    )

    setMonth(
      "September 2026"
    )

    setDueDate(
      "10 Sep 2026"
    )

    setShowCreateFee(
      true
    )

  }


  // =====================================================
  // CREATE FEE
  // =====================================================

  async function createFee() {

    if (!selectedStudent) {
      return
    }


    if (
      !amount ||
      Number(amount) <= 0
    ) {

      alert(
        "Please enter a valid fee amount."
      )

      return

    }


    if (
      !month.trim()
    ) {

      alert(
        "Please enter the fee month."
      )

      return

    }


    try {

      setCreatingFee(
        true
      )


      const studentId =
        selectedStudent.id ||
        selectedStudent._id


      const response =
        await fetch(
          FEES_API,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                studentId:
                  String(
                    studentId
                  ),

                month:
                  month.trim(),

                amount:
                  Number(
                    amount
                  ),

                dueDate:
                  dueDate.trim()

              })

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
          "Unable to create fee."
        )

      }


      // =========================================
      // NOTIFY STUDENT
      // =========================================

      try {

        await fetch(
          NOTIFICATIONS_API,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                userId:
                  String(
                    studentId
                  ),

                title:
                  "New fee assigned 💳",

                message:
                  `Your ${month.trim()} academy fee of ₹${Number(
                    amount
                  ).toLocaleString(
                    "en-IN"
                  )} has been assigned.`,

                type:
                  "payment"

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


      setShowCreateFee(
        false
      )

      setSelectedStudent(
        null
      )


      await loadData()


      window.dispatchEvent(
        new Event(
          "feesUpdated"
        )
      )


      alert(
        "Fee assigned successfully! 🎉"
      )


    } catch (error) {

      console.error(
        "Create fee error:",
        error
      )

      alert(
        error.message ||
        "Unable to create fee."
      )

    } finally {

      setCreatingFee(
        false
      )

    }

  }


  // =====================================================
  // MARK FEE AS PAID
  // =====================================================

  async function markAsPaid(
    fee,
    student
  ) {

    if (!fee?.id) {
      return
    }


    const confirmPayment =
      window.confirm(
        `Mark ₹${Number(
          fee.amount || 0
        ).toLocaleString(
          "en-IN"
        )} fee as Paid for ${student.name}?`
      )


    if (!confirmPayment) {
      return
    }


    try {

      const response =
        await fetch(
          `${FEES_API}${fee.id}/pay`,
          {
            method: "PUT",
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
          "Unable to update payment."
        )

      }


      // =========================================
      // NOTIFY STUDENT
      // =========================================

      try {

        const studentId =
          student.id ||
          student._id


        await fetch(
          NOTIFICATIONS_API,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                userId:
                  String(
                    studentId
                  ),

                title:
                  "Fee payment updated ✅",

                message:
                  `Your ${fee.month} fee of ₹${Number(
                    fee.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )} has been marked as paid.`,

                type:
                  "payment"

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


      await loadData()


      window.dispatchEvent(
        new Event(
          "feesUpdated"
        )
      )


      alert(
        "Payment marked as paid successfully! 🎉"
      )


    } catch (error) {

      console.error(
        "Payment update error:",
        error
      )

      alert(
        error.message ||
        "Unable to update payment."
      )

    }

  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredStudents =
    students.filter(
      student => {

        const name =
          String(
            student.name ||
            ""
          ).toLowerCase()


        const email =
          String(
            student.email ||
            ""
          ).toLowerCase()


        const searchText =
          search.toLowerCase()


        return (
          name.includes(
            searchText
          ) ||
          email.includes(
            searchText
          )
        )

      }
    )


  // =====================================================
  // STUDENT FEE ROWS
  // =====================================================

  const studentRows =
    filteredStudents
      .filter(
        student => {

          if (
            !selectedStudentId
          ) {
            return true
          }


          const studentId =
            student.id ||
            student._id


          return (
            String(
              studentId
            ) ===
            String(
              selectedStudentId
            )
          )

        }
      )
      .map(
        student => {

          const studentId =
            student.id ||
            student._id


          const fee =
            getStudentFee(
              studentId
            )


          return {
            student,
            fee
          }

        }
      )


  // =====================================================
  // FEES
  // =====================================================

  const paidFees =
    fees.filter(
      fee =>
        fee.status ===
        "Paid"
    )


  const pendingFees =
    fees.filter(
      fee =>
        fee.status !==
        "Paid"
    )


  // =====================================================
  // TOTAL COLLECTED
  // =====================================================

  const collectedAmount =
    paidFees.reduce(
      (
        total,
        fee
      ) =>
        total +
        Number(
          fee.amount ||
          0
        ),
      0
    )


  // =====================================================
  // TOTAL PENDING
  // =====================================================

  const pendingAmount =
    pendingFees.reduce(
      (
        total,
        fee
      ) =>
        total +
        Number(
          fee.amount ||
          0
        ),
      0
    )


  // =====================================================
  // PAID STUDENTS
  // =====================================================

  const paidStudentIds =
    new Set(
      paidFees.map(
        fee =>
          String(
            fee.studentId
          )
      )
    )


  // =====================================================
  // PENDING STUDENTS
  // =====================================================

  const pendingStudentIds =
    new Set(
      pendingFees.map(
        fee =>
          String(
            fee.studentId
          )
      )
    )


  // =====================================================
  // SELECTED STUDENT AMOUNTS
  // =====================================================

  const selectedStudentPaidAmount =
    studentRows.reduce(
      (
        total,
        row
      ) =>
        total +
        (
          row.fee?.status ===
          "Paid"
            ? Number(
                row.fee.amount ||
                0
              )
            : 0
        ),
      0
    )


  const selectedStudentPendingAmount =
    studentRows.reduce(
      (
        total,
        row
      ) =>
        total +
        (
          row.fee &&
          row.fee.status !==
            "Paid"
            ? Number(
                row.fee.amount ||
                0
              )
            : 0
        ),
      0
    )


  const selectedStudentIsPaid =
    studentRows.some(
      row =>
        row.fee?.status ===
        "Paid"
    )


  // =====================================================
  // VIEW ALL STUDENTS
  // =====================================================

  function showAllStudents() {

    setSearchParams({})

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="teacher-fees-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="teacher-fees-header">

        <div>

          <p>
            FEE MANAGEMENT
          </p>

          <h1>
            Student Fees 💳
          </h1>

          <span>
            {selectedStudentId
              ? `Fee details for ${
                  selectedStudentFromUrl?.name ||
                  "selected student"
                }.`
              : "Track monthly payments and pending fees."}
          </span>

        </div>


        {selectedStudentId && (

          <button
            type="button"
            className="secondary-button"
            onClick={
              showAllStudents
            }
          >
            👥 View All Students
          </button>

        )}

      </div>


      {/* =================================
          BACK TO DASHBOARD
      ================================= */}

      {!selectedStudentId && (

        <Link
          to="/teacher-dashboard"
          className="teacher-fees-back"
        >
          Back to Dashboard
        </Link>

      )}


      {/* =================================
          SELECTED STUDENT BANNER
      ================================= */}

      {selectedStudentId && (

        <div
          style={{
            marginBottom: "20px",
            padding: "16px 20px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg,#f3e8ff,#ede9fe)",
            border:
              "1px solid #ddd6fe",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "15px"
          }}
        >

          <div>

            <strong
              style={{
                color: "#6d28d9",
                fontSize: "16px"
              }}
            >
              👤 Selected Student
            </strong>

            <span
              style={{
                marginLeft: "8px",
                color: "#4c4560",
                fontWeight: "700"
              }}
            >
              {selectedStudentFromUrl?.name ||
                "Student"}
            </span>

          </div>


          {studentRows.length > 0 && (

            <strong
              style={{
                color: "#7c3aed"
              }}
            >
              Fee details available
            </strong>

          )}

        </div>

      )}


      {/* =================================
          ERROR
      ================================= */}

      {error && (

        <div className="payment-error">

          {error}

          <button
            onClick={
              loadData
            }
            style={{
              marginLeft: "12px"
            }}
          >
            Retry
          </button>

        </div>

      )}


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="teacher-fees-summary">


        {/* TOTAL COLLECTED */}

        <div className="teacher-fee-summary-card">

          <span>
            💰
          </span>

          <div>

            <p>
              {selectedStudentId
                ? "Student Paid"
                : "Total Collected"}
            </p>

            <h2>
              ₹
              {(
                selectedStudentId
                  ? selectedStudentPaidAmount
                  : collectedAmount
              ).toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>


        {/* PENDING */}

        <div className="teacher-fee-summary-card">

          <span>
            ⏳
          </span>

          <div>

            <p>
              {selectedStudentId
                ? "Student Pending"
                : "Pending Amount"}
            </p>

            <h2>
              ₹
              {(
                selectedStudentId
                  ? selectedStudentPendingAmount
                  : pendingAmount
              ).toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>


        {/* STATUS */}

        <div className="teacher-fee-summary-card">

          <span>
            ✅
          </span>

          <div>

            <p>
              {selectedStudentId
                ? "Payment Status"
                : "Paid Students"}
            </p>

            <h2>
              {selectedStudentId
                ? (
                    selectedStudentIsPaid
                      ? "Paid"
                      : "Pending"
                  )
                : paidStudentIds.size}
            </h2>

          </div>

        </div>


        {/* PENDING STUDENTS */}

        <div className="teacher-fee-summary-card">

          <span>
            ⚠️
          </span>

          <div>

            <p>
              {selectedStudentId
                ? "Fee Records"
                : "Pending Students"}
            </p>

            <h2>
              {selectedStudentId
                ? studentRows.length
                : pendingStudentIds.size}
            </h2>

          </div>

        </div>

      </div>


      {/* =================================
          FEE TABLE
      ================================= */}

      <div className="teacher-fees-card">


        <div className="teacher-fees-card-header">

          <div>

            <p>
              SEPTEMBER 2026
            </p>

            <h2>
              {selectedStudentId
                ? "Selected Student Fee"
                : "Monthly Fee Status"}
            </h2>

          </div>


          {!selectedStudentId && (

            <input
              type="text"
              placeholder="Search student..."
              value={
                search
              }
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
            />

          )}

        </div>


        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="no-fee-results">

            <div>
              ⏳
            </div>

            <h3>
              Loading fee information...
            </h3>

          </div>

        )}


        {/* =================================
            TABLE
        ================================= */}

        {!loading &&
          studentRows.length > 0 && (

            <div className="teacher-fees-table-wrapper">

              <table className="teacher-fees-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Course
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
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {studentRows.map(
                    ({
                      student,
                      fee
                    }) => (

                      <tr
                        key={
                          student.id ||
                          student._id
                        }
                      >

                        {/* STUDENT */}

                        <td>

                          <strong>
                            {student.name}
                          </strong>

                          <br />

                          <small>
                            {student.email}
                          </small>

                        </td>


                        {/* COURSE */}

                        <td>
                          {student.course ||
                            student.program ||
                            "Music Training"}
                        </td>


                        {/* AMOUNT */}

                        <td>

                          {fee ? (

                            <>
                              ₹
                              {Number(
                                fee.amount ||
                                0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </>

                          ) : (

                            <span>
                              —
                            </span>

                          )}

                        </td>


                        {/* DUE DATE */}

                        <td>

                          {fee
                            ? fee.dueDate
                            : "Not Assigned"}

                        </td>


                        {/* STATUS */}

                        <td>

                          {!fee && (

                            <span className="fee-pending">
                              Not Assigned
                            </span>

                          )}


                          {fee &&
                            fee.status ===
                              "Paid" && (

                              <span className="fee-paid">
                                ✓ Paid
                              </span>

                            )}


                          {fee &&
                            fee.status !==
                              "Paid" && (

                              <span className="fee-pending">
                                ⏳ Pending
                              </span>

                            )}

                        </td>


                        {/* ACTION */}

                        <td>

                          {!fee && (

                            <button
                              className="fee-status-btn"
                              onClick={() =>
                                openCreateFee(
                                  student
                                )
                              }
                            >
                              + Assign Fee
                            </button>

                          )}


                          {fee &&
                            fee.status !==
                              "Paid" && (

                              <button
                                className="fee-status-btn"
                                onClick={() =>
                                  markAsPaid(
                                    fee,
                                    student
                                  )
                                }
                              >
                                Mark as Paid
                              </button>

                            )}


                          {fee &&
                            fee.status ===
                              "Paid" && (

                              <span>
                                Completed ✓
                              </span>

                            )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


        {/* =================================
            NO STUDENTS
        ================================= */}

        {!loading &&
          studentRows.length === 0 && (

            <div className="no-fee-results">

              <div>
                🔍
              </div>

              <h3>
                {selectedStudentId
                  ? "No fee record found"
                  : "No student found"}
              </h3>

              <p>
                {selectedStudentId
                  ? "This student does not have a fee assigned yet."
                  : "Try searching with a different student name."}
              </p>


              {selectedStudentFromUrl && (

                <button
                  className="fee-status-btn"
                  onClick={() =>
                    openCreateFee(
                      selectedStudentFromUrl
                    )
                  }
                >
                  + Assign Fee
                </button>

              )}

            </div>

          )}

      </div>


      {/* =================================
          CREATE FEE MODAL
      ================================= */}

      {showCreateFee &&
        selectedStudent && (

          <div
            className="payment-qr-overlay"
            onClick={() =>
              setShowCreateFee(
                false
              )
            }
          >

            <div
              className="payment-qr-modal"
              onClick={
                event =>
                  event.stopPropagation()
              }
            >

              <button
                className="payment-qr-close"
                onClick={() =>
                  setShowCreateFee(
                    false
                  )
                }
              >
                ✕
              </button>


              <p className="payment-qr-label">
                FEE MANAGEMENT
              </p>


              <h2>
                Assign Monthly Fee 💳
              </h2>


              <p>

                Student:
                {" "}

                <strong>
                  {selectedStudent.name}
                </strong>

              </p>


              {/* MONTH */}

              <label>
                Month
              </label>

              <input
                type="text"
                value={
                  month
                }
                onChange={
                  event =>
                    setMonth(
                      event.target.value
                    )
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "6px",
                  marginBottom: "14px"
                }}
              />


              {/* AMOUNT */}

              <label>
                Amount
              </label>

              <input
                type="number"
                value={
                  amount
                }
                onChange={
                  event =>
                    setAmount(
                      event.target.value
                    )
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "6px",
                  marginBottom: "14px"
                }}
              />


              {/* DUE DATE */}

              <label>
                Due Date
              </label>

              <input
                type="text"
                value={
                  dueDate
                }
                onChange={
                  event =>
                    setDueDate(
                      event.target.value
                    )
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "6px",
                  marginBottom: "20px"
                }}
              />


              {/* CREATE */}

              <button
                className="payment-complete-btn"
                onClick={
                  createFee
                }
                disabled={
                  creatingFee
                }
              >

                {creatingFee
                  ? "Creating..."
                  : "✓ Assign Fee"}

              </button>


              {/* CANCEL */}

              <button
                className="payment-cancel-btn"
                onClick={() =>
                  setShowCreateFee(
                    false
                  )
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


export default TeacherFees