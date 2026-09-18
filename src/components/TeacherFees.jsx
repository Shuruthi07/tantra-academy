import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


const defaultStudents = [
  {
    id: 1,
    name: "Arun Kumar",
    course: "Vocal Training",
    amount: 3000,
    dueDate: "10 Sep 2026",
    status: "Paid"
  },
  {
    id: 2,
    name: "Priya Sharma",
    course: "Piano",
    amount: 3000,
    dueDate: "10 Sep 2026",
    status: "Paid"
  },
  {
    id: 3,
    name: "Rahul Raj",
    course: "Guitar",
    amount: 3000,
    dueDate: "10 Sep 2026",
    status: "Pending"
  },
  {
    id: 4,
    name: "Ananya S",
    course: "Vocal Training",
    amount: 3000,
    dueDate: "10 Sep 2026",
    status: "Paid"
  },
  {
    id: 5,
    name: "Karthik M",
    course: "Guitar",
    amount: 3000,
    dueDate: "10 Sep 2026",
    status: "Pending"
  },
  {
    id: 6,
    name: "Meena Devi",
    course: "Piano",
    amount: 3000,
    dueDate: "10 Sep 2026",
    status: "Paid"
  }
]


function TeacherFees() {

  const [students, setStudents] = useState(() =>
    JSON.parse(
      localStorage.getItem("tantraFees") || "null"
    ) || defaultStudents
  )


  const [search, setSearch] = useState("")


  // ==============================
  // LOAD FEE DATA
  // ==============================

  useEffect(() => {

    function loadFees() {

      const savedFees =
        JSON.parse(
          localStorage.getItem("tantraFees") || "null"
        )


      if (savedFees) {
        setStudents(savedFees)
      } else {
        setStudents(defaultStudents)
      }

    }


    loadFees()


    window.addEventListener(
      "storage",
      loadFees
    )


    window.addEventListener(
      "feesUpdated",
      loadFees
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadFees
      )

      window.removeEventListener(
        "feesUpdated",
        loadFees
      )

    }

  }, [])


  // ==============================
  // TOGGLE FEE STATUS
  // ==============================

  function toggleFeeStatus(id) {

    let changedStudent = null


    const updatedStudents =
      students.map((student) => {

        if (student.id === id) {

          changedStudent = {
            ...student,
            status:
              student.status === "Paid"
                ? "Pending"
                : "Paid"
          }

          return changedStudent

        }

        return student

      })


    if (!changedStudent) {
      return
    }


    setStudents(updatedStudents)


    localStorage.setItem(
      "tantraFees",
      JSON.stringify(updatedStudents)
    )


    // Update Student Payments page

    window.dispatchEvent(
      new Event("feesUpdated")
    )


    // ==============================
    // STUDENT NOTIFICATION
    // ==============================

    const existingNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraNotifications"
        ) || "[]"
      )


    const newNotification = {

      id: Date.now(),

      icon:
        changedStudent.status === "Paid"
          ? "✅"
          : "💳",

      title:
        changedStudent.status === "Paid"
          ? "Fee payment updated"
          : "Fee payment pending",

      message:
        changedStudent.status === "Paid"
          ? `Your ${changedStudent.course} fee of ₹${Number(
              changedStudent.amount || 0
            ).toLocaleString()} has been marked as paid.`
          : `Your ${changedStudent.course} fee of ₹${Number(
              changedStudent.amount || 0
            ).toLocaleString()} is pending.`,

      type: "Fee",

      time: "Just now",

      unread: true

    }


    localStorage.setItem(
      "tantraNotifications",
      JSON.stringify([
        newNotification,
        ...existingNotifications
      ])
    )


    window.dispatchEvent(
      new Event("notificationsUpdated")
    )

  }


  // ==============================
  // SEARCH
  // ==============================

  const filteredStudents =
    students.filter((student) =>
      String(student.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    )


  // ==============================
  // PAID STUDENTS
  // ==============================

  const paidStudents =
    students.filter(
      (student) =>
        student.status === "Paid"
    )


  // ==============================
  // PENDING STUDENTS
  // ==============================

  const pendingStudents =
    students.filter(
      (student) =>
        student.status === "Pending"
    )


  // ==============================
  // TOTAL COLLECTED
  // ==============================

  const collectedAmount =
    paidStudents.reduce(
      (total, student) =>
        total +
        Number(student.amount || 0),
      0
    )


  // ==============================
  // TOTAL PENDING
  // ==============================

  const pendingAmount =
    pendingStudents.reduce(
      (total, student) =>
        total +
        Number(student.amount || 0),
      0
    )


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
            Track monthly payments and pending fees.
          </span>

        </div>

      </div>


      {/* =================================
          BACK TO DASHBOARD
      ================================= */}

      <Link
        to="/teacher-dashboard"
        className="teacher-fees-back"
      >
        Back to Dashboard
      </Link>


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
              Total Collected
            </p>

            <h2>
              ₹{collectedAmount.toLocaleString()}
            </h2>

          </div>

        </div>


        {/* PENDING AMOUNT */}

        <div className="teacher-fee-summary-card">

          <span>
            ⏳
          </span>

          <div>

            <p>
              Pending Amount
            </p>

            <h2>
              ₹{pendingAmount.toLocaleString()}
            </h2>

          </div>

        </div>


        {/* PAID STUDENTS */}

        <div className="teacher-fee-summary-card">

          <span>
            ✅
          </span>

          <div>

            <p>
              Paid Students
            </p>

            <h2>
              {paidStudents.length}
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
              Pending Students
            </p>

            <h2>
              {pendingStudents.length}
            </h2>

          </div>

        </div>

      </div>


      {/* =================================
          FEE TABLE CARD
      ================================= */}

      <div className="teacher-fees-card">


        <div className="teacher-fees-card-header">

          <div>

            <p>
              SEPTEMBER 2026
            </p>

            <h2>
              Monthly Fee Status
            </h2>

          </div>


          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {/* =================================
            TABLE
        ================================= */}

        {filteredStudents.length > 0 ? (

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

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={student.id}
                    >

                      <td>

                        <strong>
                          {student.name}
                        </strong>

                      </td>


                      <td>
                        {student.course}
                      </td>


                      <td>
                        ₹{Number(
                          student.amount || 0
                        ).toLocaleString()}
                      </td>


                      <td>
                        {student.dueDate}
                      </td>


                      <td>

                        <span
                          className={
                            student.status === "Paid"
                              ? "fee-paid"
                              : "fee-pending"
                          }
                        >

                          {student.status === "Paid"
                            ? "✓ Paid"
                            : "⏳ Pending"}

                        </span>

                      </td>


                      <td>

                        <button
                          className="fee-status-btn"
                          onClick={() =>
                            toggleFeeStatus(
                              student.id
                            )
                          }
                        >

                          Mark as{" "}

                          {student.status === "Paid"
                            ? "Pending"
                            : "Paid"}

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="no-fee-results">

            <div>
              🔍
            </div>

            <h3>
              No student found
            </h3>

            <p>
              Try searching with a different student name.
            </p>

          </div>

        )}

      </div>

    </div>

  )

}


export default TeacherFees