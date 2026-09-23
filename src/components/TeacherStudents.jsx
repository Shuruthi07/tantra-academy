import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const BACKEND_URL = "http://127.0.0.1:5000"

function TeacherStudents() {

  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    course: ""
  })

  /* =========================================
     AUTH
     ========================================= */

  const getToken = () => {
    return sessionStorage.getItem(
      "tantraAuthToken"
    )
  }

  const getAuthHeaders = () => {

    const token = getToken()

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})
    }
  }

  /* =========================================
     INITIALS
     ========================================= */

  const getInitials = (name = "") => {

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    if (words.length === 0) {
      return "ST"
    }

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase()
    }

    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase()
  }

  /* =========================================
     NORMALIZE STUDENT
     ========================================= */

  const normalizeStudent = (student) => {

    const id =
      student.id ||
      student._id ||
      student.studentId ||
      ""

    const name =
      student.name ||
      student.studentName ||
      "Unknown Student"

    const course =
      student.course ||
      student.courseName ||
      student.program ||
      "Not assigned"

    const attendanceValue =
      Number(
        student.attendance ??
        student.attendancePercentage ??
        0
      ) || 0

    const progressValue =
      Number(
        student.progress ??
        student.progressPercentage ??
        0
      ) || 0

    const feeStatusRaw =
      student.feeStatus ||
      student.fee ||
      student.paymentStatus ||
      "Pending"

    const feeStatus =
      String(feeStatusRaw)
        .toLowerCase() === "paid"
        ? "Paid"
        : "Pending"

    return {
      ...student,

      id,

      name,

      email:
        student.email || "",

      phone:
        student.phone || "",

      course,

      attendance:
        Math.max(
          0,
          Math.min(
            100,
            attendanceValue
          )
        ),

      progress:
        Math.max(
          0,
          Math.min(
            100,
            progressValue
          )
        ),

      feeStatus
    }
  }

  /* =========================================
     ENRICH STUDENTS
     ========================================= */

  const enrichStudents = async (
    studentList
  ) => {

    const enriched =
      await Promise.all(
        studentList.map(
          async (student) => {

            if (!student.id) {
              return student
            }

            let updatedStudent = {
              ...student
            }

            /* -------------------------------
               ATTENDANCE
               ------------------------------- */

            try {

              const response =
                await fetch(
                  `${BACKEND_URL}/api/attendance?studentId=${encodeURIComponent(
                    student.id
                  )}`,
                  {
                    headers:
                      getAuthHeaders()
                  }
                )

              if (response.ok) {

                const data =
                  await response.json()

                const records =
                  Array.isArray(
                    data.attendance
                  )
                    ? data.attendance
                    : Array.isArray(
                        data.data
                      )
                    ? data.data
                    : []

                if (
                  records.length > 0
                ) {

                  const presentCount =
                    records.filter(
                      record =>
                        String(
                          record.status ||
                          ""
                        ).toLowerCase() ===
                        "present"
                    ).length

                  const attendance =
                    Math.round(
                      (
                        presentCount /
                        records.length
                      ) * 100
                    )

                  updatedStudent.attendance =
                    attendance
                }
              }

            } catch (error) {

              console.log(
                "Attendance unavailable:",
                error
              )
            }

            /* -------------------------------
               SONG PROGRESS
               ------------------------------- */

            try {

              const response =
                await fetch(
                  `${BACKEND_URL}/api/song-progress?studentId=${encodeURIComponent(
                    student.id
                  )}`,
                  {
                    headers:
                      getAuthHeaders()
                  }
                )

              if (response.ok) {

                const data =
                  await response.json()

                const records =
                  Array.isArray(
                    data.progress
                  )
                    ? data.progress
                    : Array.isArray(
                        data.data
                      )
                    ? data.data
                    : []

                if (
                  records.length > 0
                ) {

                  const total =
                    records.reduce(
                      (
                        sum,
                        item
                      ) =>
                        sum +
                        Number(
                          item.progress ||
                          item.percentage ||
                          0
                        ),
                      0
                    )

                  const average =
                    Math.round(
                      total /
                      records.length
                    )

                  updatedStudent.progress =
                    Math.max(
                      0,
                      Math.min(
                        100,
                        average
                      )
                    )
                }
              }

            } catch (error) {

              console.log(
                "Song progress unavailable:",
                error
              )
            }

            /* -------------------------------
               FEES
               ------------------------------- */

            try {

              const response =
                await fetch(
                  `${BACKEND_URL}/api/fees?studentId=${encodeURIComponent(
                    student.id
                  )}`,
                  {
                    headers:
                      getAuthHeaders()
                  }
                )

              if (response.ok) {

                const data =
                  await response.json()

                const records =
                  Array.isArray(
                    data.fees
                  )
                    ? data.fees
                    : Array.isArray(
                        data.data
                      )
                    ? data.data
                    : []

                if (
                  records.length > 0
                ) {

                  const latest =
                    records[
                      records.length - 1
                    ]

                  const status =
                    String(
                      latest.status ||
                      latest.paymentStatus ||
                      ""
                    ).toLowerCase()

                  updatedStudent.feeStatus =
                    status === "paid"
                      ? "Paid"
                      : "Pending"
                }
              }

            } catch (error) {

              console.log(
                "Fees unavailable:",
                error
              )
            }

            return updatedStudent
          }
        )
      )

    return enriched
  }

  /* =========================================
     LOAD STUDENTS
     ========================================= */

  const loadStudents = async () => {

    setLoading(true)
    setError("")

    try {

      const token = getToken()

      if (!token) {

        setError(
          "You are not logged in."
        )

        setLoading(false)

        return
      }

      const response =
        await fetch(
          `${BACKEND_URL}/api/admin/teacher-students`,
          {
            method: "GET",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      if (response.status === 401) {

        sessionStorage.removeItem(
          "tantraAuthToken"
        )

        sessionStorage.removeItem(
          "tantraLoggedInUser"
        )

        sessionStorage.removeItem(
          "tantraCurrentUser"
        )

        window.location.href =
          "/login"

        return
      }

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to load students"
        )
      }

      const backendStudents =
        Array.isArray(
          data.students
        )
          ? data.students
          : Array.isArray(
              data.data
            )
          ? data.data
          : []

      const normalized =
        backendStudents.map(
          normalizeStudent
        )

      setStudents(normalized)

      localStorage.setItem(
        "tantraStudents",
        JSON.stringify(normalized)
      )

      const enriched =
        await enrichStudents(
          normalized
        )

      setStudents(enriched)

      localStorage.setItem(
        "tantraStudents",
        JSON.stringify(enriched)
      )

    } catch (error) {

      console.error(
        "Teacher students error:",
        error
      )

      try {

        const localStudents =
          JSON.parse(
            localStorage.getItem(
              "tantraStudents"
            ) || "[]"
          )

        if (
          Array.isArray(
            localStudents
          ) &&
          localStudents.length > 0
        ) {

          setStudents(
            localStudents.map(
              normalizeStudent
            )
          )

          setError("")

        } else {

          setError(
            error.message ||
            "Unable to load students"
          )
        }

      } catch {

        setError(
          error.message ||
          "Unable to load students"
        )
      }

    } finally {

      setLoading(false)
    }
  }

  /* =========================================
     INITIAL LOAD + EVENTS
     ========================================= */

  useEffect(() => {

    loadStudents()

    const refresh =
      () => {
        loadStudents()
      }

    window.addEventListener(
      "storage",
      refresh
    )

    window.addEventListener(
      "studentsUpdated",
      refresh
    )

    window.addEventListener(
      "attendanceUpdated",
      refresh
    )

    window.addEventListener(
      "progressUpdated",
      refresh
    )

    window.addEventListener(
      "feesUpdated",
      refresh
    )

    window.addEventListener(
      "songsUpdated",
      refresh
    )

    return () => {

      window.removeEventListener(
        "storage",
        refresh
      )

      window.removeEventListener(
        "studentsUpdated",
        refresh
      )

      window.removeEventListener(
        "attendanceUpdated",
        refresh
      )

      window.removeEventListener(
        "progressUpdated",
        refresh
      )

      window.removeEventListener(
        "feesUpdated",
        refresh
      )

      window.removeEventListener(
        "songsUpdated",
        refresh
      )
    }

  }, [])

  /* =========================================
     SEARCH
     ========================================= */

  const filteredStudents =
    useMemo(() => {

      const text =
        search
          .trim()
          .toLowerCase()

      if (!text) {
        return students
      }

      return students.filter(
        student => {

          const name =
            String(
              student.name || ""
            ).toLowerCase()

          const email =
            String(
              student.email || ""
            ).toLowerCase()

          const course =
            String(
              student.course || ""
            ).toLowerCase()

          return (
            name.includes(text) ||
            email.includes(text) ||
            course.includes(text)
          )
        }
      )

    }, [students, search])

  /* =========================================
     STATISTICS
     ========================================= */

  const totalStudents =
    students.length

  const presentStudents =
    students.filter(
      student =>
        Number(
          student.attendance
        ) >= 75
    ).length

  const pendingFees =
    students.filter(
      student =>
        student.feeStatus !== "Paid"
    ).length

  /* =========================================
     VIEW STUDENT
     ========================================= */

  const handleViewStudent = (
    student
  ) => {

    setSelectedStudent(
      student
    )

    setShowModal(true)
  }

  const closeStudentModal = () => {

    setShowModal(false)

    setSelectedStudent(
      null
    )
  }

  /* =========================================
     QUICK ACTIONS
     ========================================= */

  const openStudentPage = (
    page
  ) => {

    if (!selectedStudent) {
      return
    }

    const studentId =
      selectedStudent.id ||
      selectedStudent._id ||
      ""

    setShowModal(false)

    navigate(
      `${page}?studentId=${encodeURIComponent(
        studentId
      )}`
    )
  }

  /* =========================================
     ADD STUDENT
     ========================================= */

  const handleAddStudent = async (
    event
  ) => {

    event.preventDefault()

    if (
      !newStudent.name.trim()
    ) {

      alert(
        "Please enter student name."
      )

      return
    }

    const student = {

      id:
        `local-${Date.now()}`,

      name:
        newStudent.name.trim(),

      email:
        newStudent.email.trim(),

      phone:
        newStudent.phone.trim(),

      course:
        newStudent.course.trim() ||
        "Not assigned",

      attendance: 0,

      progress: 0,

      feeStatus: "Pending"
    }

    try {

      const existing =
        JSON.parse(
          localStorage.getItem(
            "tantraStudents"
          ) || "[]"
        )

      const updated = [
        ...existing,
        student
      ]

      localStorage.setItem(
        "tantraStudents",
        JSON.stringify(updated)
      )

      setStudents(
        updated.map(
          normalizeStudent
        )
      )

      window.dispatchEvent(
        new Event(
          "studentsUpdated"
        )
      )

      setNewStudent({
        name: "",
        email: "",
        phone: "",
        course: ""
      })

      setShowAddModal(false)

      alert(
        "Student added successfully."
      )

    } catch (error) {

      console.error(
        "Add student error:",
        error
      )

      alert(
        "Unable to add student."
      )
    }
  }

  /* =========================================
     FEE TOGGLE
     ========================================= */

  const toggleFee = (
    studentId
  ) => {

    const updated =
      students.map(
        student => {

          if (
            String(student.id) ===
            String(studentId)
          ) {

            return {
              ...student,

              feeStatus:
                student.feeStatus ===
                "Paid"
                  ? "Pending"
                  : "Paid"
            }
          }

          return student
        }
      )

    setStudents(updated)

    localStorage.setItem(
      "tantraStudents",
      JSON.stringify(updated)
    )

    window.dispatchEvent(
      new Event(
        "feesUpdated"
      )
    )
  }

  /* =========================================
     PROGRESS CLASS
     ========================================= */

  const getProgressClass = (
    progress
  ) => {

    if (progress >= 75) {
      return "progress-high"
    }

    if (progress >= 40) {
      return "progress-medium"
    }

    return "progress-low"
  }

  /* =========================================
     ATTENDANCE CLASS
     ========================================= */

  const getAttendanceClass = (
    attendance
  ) => {

    if (attendance >= 75) {
      return "attendance-good"
    }

    if (attendance >= 50) {
      return "attendance-average"
    }

    return "attendance-low"
  }

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {

    return (
      <div className="teacher-students-page">

        <div className="students-loading">

          <div className="loading-spinner">
            ⏳
          </div>

          <h3>
            Loading students...
          </h3>

          <p>
            Please wait while we load
            student information.
          </p>

        </div>

      </div>
    )
  }

  /* =========================================
     PAGE
     ========================================= */

  return (
    <div className="teacher-students-page">

      {/* =====================================
          HEADER
          ===================================== */}

      <div className="students-page-header">

        <div>

          <h1>
            All Students
          </h1>

          <p>
            Manage and monitor your students
          </p>

        </div>

        <button
          className="add-student-btn"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          + Add Student
        </button>

      </div>

      {/* =====================================
          ERROR
          ===================================== */}

      {error && (
        <div className="students-error">

          <span>
            ⚠️
          </span>

          <div>

            <strong>
              Unable to load students
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            onClick={
              loadStudents
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* =====================================
          SUMMARY
          ===================================== */}

      <div className="students-summary">

        <div className="student-summary-card purple">

          <div className="summary-icon">
            👨‍🎓
          </div>

          <div>

            <span>
              Total Students
            </span>

            <strong>
              {totalStudents}
            </strong>

          </div>

        </div>

        <div className="student-summary-card blue">

          <div className="summary-icon">
            📊
          </div>

          <div>

            <span>
              Attendance ≥ 75%
            </span>

            <strong>
              {presentStudents}
            </strong>

          </div>

        </div>

        <div className="student-summary-card orange">

          <div className="summary-icon">
            💳
          </div>

          <div>

            <span>
              Pending Fees
            </span>

            <strong>
              {pendingFees}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================
          STUDENTS CARD
          ===================================== */}

      <div className="students-card">

        <div className="students-card-header">

          <div>

            <h2>
              Students
            </h2>

            <p>
              {filteredStudents.length} student
              {filteredStudents.length !== 1
                ? "s"
                : ""} found
            </p>

          </div>

          <div className="student-search">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={event =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* ===================================
            TABLE
            =================================== */}

        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>

              <tr>

                <th>
                  STUDENT
                </th>

                <th>
                  COURSE
                </th>

                <th>
                  ATTENDANCE
                </th>

                <th>
                  FEE
                </th>

                <th>
                  PROGRESS
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="no-students"
                  >

                    <div>
                      👨‍🎓
                    </div>

                    <h3>
                      No students found
                    </h3>

                    <p>
                      Try changing your search
                      or add a new student.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredStudents.map(
                  student => {

                    const attendance =
                      Number(
                        student.attendance
                      ) || 0

                    const progress =
                      Number(
                        student.progress
                      ) || 0

                    return (
                      <tr
                        key={
                          student.id ||
                          student.email ||
                          student.name
                        }
                      >

                        {/* STUDENT */}

                        <td>

                          <div className="student-info">

                            <div className="student-avatar">

                              {getInitials(
                                student.name
                              )}

                            </div>

                            <div className="student-details">

                              <div className="student-name">

                                {student.name}

                              </div>

                              {student.email && (
                                <div className="student-email">

                                  {student.email}

                                </div>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* COURSE */}

                        <td>

                          <span className="course-value">

                            {student.course ||
                              "Not assigned"}

                          </span>

                        </td>

                        {/* ATTENDANCE */}

                        <td>

                          <span
                            className={`attendance-value ${getAttendanceClass(
                              attendance
                            )}`}
                          >

                            {attendance}%

                          </span>

                        </td>

                        {/* FEE */}

                        <td>

                          <button
                            type="button"
                            className={
                              student.feeStatus ===
                              "Paid"
                                ? "fee-paid"
                                : "fee-pending"
                            }
                            onClick={() =>
                              toggleFee(
                                student.id
                              )
                            }
                            title="Click to change fee status"
                          >

                            <span className="fee-icon">
                              💳
                            </span>

                            {student.feeStatus ===
                            "Paid"
                              ? "Paid"
                              : "Pending"}

                          </button>

                        </td>

                        {/* PROGRESS */}

                        <td>

                          <div className="progress-cell">

                            <div className="progress-bar">

                              <div
                                className={`progress-fill ${getProgressClass(
                                  progress
                                )}`}
                                style={{
                                  width:
                                    `${progress}%`
                                }}
                              />

                            </div>

                            <span className="progress-text">

                              {progress}%

                            </span>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            type="button"
                            className="view-btn"
                            onClick={() =>
                              handleViewStudent(
                                student
                              )
                            }
                          >

                            <span>
                              👁️
                            </span>

                            View

                          </button>

                        </td>

                      </tr>
                    )
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================
          VIEW STUDENT MODAL
          ===================================== */}

      {showModal &&
        selectedStudent && (

          <div
            className="student-modal-overlay"
            onClick={
              closeStudentModal
            }
          >

            <div
              className="student-modal"
              onClick={event =>
                event.stopPropagation()
              }
            >

              <button
                className="modal-close-btn"
                onClick={
                  closeStudentModal
                }
              >
                ×
              </button>

              {/* STUDENT HEADER */}

              <div className="modal-student-header">

                <div className="modal-student-avatar">

                  {getInitials(
                    selectedStudent.name
                  )}

                </div>

                <div>

                  <h2>
                    {selectedStudent.name}
                  </h2>

                  <p>
                    {selectedStudent.email ||
                      "Student"}
                  </p>

                </div>

              </div>

              {/* DETAILS */}

              <div className="modal-details-grid">

                <div className="modal-detail-card">

                  <span>
                    Course
                  </span>

                  <strong>
                    {selectedStudent.course ||
                      "Not assigned"}
                  </strong>

                </div>

                <div className="modal-detail-card">

                  <span>
                    Attendance
                  </span>

                  <strong>
                    {selectedStudent.attendance}%
                  </strong>

                </div>

                <div className="modal-detail-card">

                  <span>
                    Fee Status
                  </span>

                  <strong
                    className={
                      selectedStudent.feeStatus ===
                      "Paid"
                        ? "modal-paid"
                        : "modal-pending"
                    }
                  >
                    {selectedStudent.feeStatus}
                  </strong>

                </div>

                <div className="modal-detail-card">

                  <span>
                    Song Progress
                  </span>

                  <strong>
                    {selectedStudent.progress}%
                  </strong>

                </div>

              </div>

              {/* LEARNING PROGRESS */}

              <div className="modal-progress-section">

                <div className="modal-section-title">

                  <span>
                    Learning Progress
                  </span>

                  <strong>
                    {selectedStudent.progress}%
                  </strong>

                </div>

                <div className="modal-progress-bar">

                  <div
                    style={{
                      width:
                        `${selectedStudent.progress}%`
                    }}
                  />

                </div>

              </div>

              {/* =================================
                  QUICK ACTIONS
                  ================================= */}

              <div className="student-quick-actions">

                <h3>
                  Quick Actions
                </h3>

                <div className="quick-actions-grid">

                  <button
                    type="button"
                    onClick={() =>
                      openStudentPage(
                        "/teacher-attendance"
                      )
                    }
                  >

                    <span>
                      📊
                    </span>

                    <strong>
                      Attendance
                    </strong>

                    <small>
                      View attendance
                    </small>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openStudentPage(
                        "/teacher-songs"
                      )
                    }
                  >

                    <span>
                      🎵
                    </span>

                    <strong>
                      Songs
                    </strong>

                    <small>
                      View song progress
                    </small>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openStudentPage(
                        "/teacher-tasks"
                      )
                    }
                  >

                    <span>
                      📋
                    </span>

                    <strong>
                      Tasks
                    </strong>

                    <small>
                      View student tasks
                    </small>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openStudentPage(
                        "/teacher-fees"
                      )
                    }
                  >

                    <span>
                      💳
                    </span>

                    <strong>
                      Fees
                    </strong>

                    <small>
                      View fee details
                    </small>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openStudentPage(
                        "/teacher-schedule"
                      )
                    }
                  >

                    <span>
                      📅
                    </span>

                    <strong>
                      Schedule
                    </strong>

                    <small>
                      View schedule
                    </small>

                  </button>

                </div>

              </div>

              {/* ACTION */}

              <div className="modal-actions">

                <button
                  className="modal-secondary-btn"
                  onClick={
                    closeStudentModal
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================
          ADD STUDENT MODAL
          ===================================== */}

      {showAddModal && (

        <div
          className="student-modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >

          <div
            className="student-modal add-student-modal"
            onClick={event =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close-btn"
              onClick={() =>
                setShowAddModal(false)
              }
            >
              ×
            </button>

            <h2>
              Add New Student
            </h2>

            <p className="modal-description">
              Enter the student's details below.
            </p>

            <form
              onSubmit={
                handleAddStudent
              }
            >

              <div className="form-group">

                <label>
                  Student Name
                </label>

                <input
                  type="text"
                  value={
                    newStudent.name
                  }
                  onChange={event =>
                    setNewStudent({
                      ...newStudent,
                      name:
                        event.target.value
                    })
                  }
                  placeholder="Enter student name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={
                    newStudent.email
                  }
                  onChange={event =>
                    setNewStudent({
                      ...newStudent,
                      email:
                        event.target.value
                    })
                  }
                  placeholder="Enter email"
                />

              </div>

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  value={
                    newStudent.phone
                  }
                  onChange={event =>
                    setNewStudent({
                      ...newStudent,
                      phone:
                        event.target.value
                    })
                  }
                  placeholder="Enter phone number"
                />

              </div>

              <div className="form-group">

                <label>
                  Course
                </label>

                <input
                  type="text"
                  value={
                    newStudent.course
                  }
                  onChange={event =>
                    setNewStudent({
                      ...newStudent,
                      course:
                        event.target.value
                    })
                  }
                  placeholder="Enter course"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-primary-btn"
                >
                  Add Student
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default TeacherStudents