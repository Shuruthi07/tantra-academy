import { useEffect, useMemo, useState } from "react"

const TASKS_API =
  "https://tantra-academy-1.onrender.com/api/admin/tasks"

const STUDENTS_API =
  "https://tantra-academy-1.onrender.com/api/admin/students"

const PROGRESS_API =
  "https://tantra-academy-1.onrender.com/api/task-progress"


function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [students, setStudents] = useState([])
  const [progress, setProgress] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [studentLoading, setStudentLoading] =
    useState(true)

  const [progressLoading, setProgressLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [showForm, setShowForm] =
    useState(false)

  const [editingTask, setEditingTask] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState("")

  const [form, setForm] = useState({
    title: "",
    course: "Vocal Training",
    instructions: "",
    dueDate: "",
    assignedStudentId: ""
  })


  // =====================================================
  // HELPERS
  // =====================================================

  function getTaskId(task) {
    return (
      task?.id ||
      task?._id ||
      ""
    )
  }

  function getStudentId(student) {
    return (
      student?.id ||
      student?._id ||
      ""
    )
  }

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
              "Bearer " + token
          }
        : {})
    }
  }


  // =====================================================
  // LOAD TASKS
  // =====================================================

  async function loadTasks() {
    try {
      setLoading(true)
      setError("")

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {
        setError(
          "Your admin session has expired. Please login again."
        )
        return
      }

      const response =
        await fetch(
          `${TASKS_API}?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      console.log(
        "Admin tasks:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "You are not authorized to manage tasks."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load tasks."
        )
      }

      setTasks(
        Array.isArray(data.tasks)
          ? data.tasks
          : []
      )
    } catch (error) {
      console.error(
        "Task loading error:",
        error
      )

      setError(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  async function loadStudents() {
    try {
      setStudentLoading(true)

      const response =
        await fetch(
          `${STUDENTS_API}?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
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
            "Unable to load students."
        )
      }

      setStudents(
        Array.isArray(
          data.students
        )
          ? data.students
          : []
      )
    } catch (error) {
      console.error(
        "Student loading error:",
        error
      )

      setStudents([])
    } finally {
      setStudentLoading(false)
    }
  }


  // =====================================================
  // LOAD PROGRESS
  // =====================================================

  async function loadProgress() {
    try {
      setProgressLoading(true)

      const response =
        await fetch(
          `${PROGRESS_API}?_=${Date.now()}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        setProgress([])
        return
      }

      setProgress(
        Array.isArray(
          data.progress
        )
          ? data.progress
          : []
      )
    } catch (error) {
      console.error(
        "Progress loading error:",
        error
      )

      setProgress([])
    } finally {
      setProgressLoading(false)
    }
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadTasks()
    loadStudents()
    loadProgress()
  }, [])


  // =====================================================
  // LISTEN FOR UPDATES
  // =====================================================

  useEffect(() => {
    function handleTaskUpdate() {
      loadTasks()
      loadProgress()
    }

    window.addEventListener(
      "tasksUpdated",
      handleTaskUpdate
    )

    window.addEventListener(
      "taskProgressUpdated",
      handleTaskUpdate
    )

    return () => {
      window.removeEventListener(
        "tasksUpdated",
        handleTaskUpdate
      )

      window.removeEventListener(
        "taskProgressUpdated",
        handleTaskUpdate
      )
    }
  }, [])


  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(event) {
    const {
      name,
      value
    } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  function openAddForm() {
    setEditingTask(null)

    setForm({
      title: "",
      course: "Vocal Training",
      instructions: "",
      dueDate: "",
      assignedStudentId: ""
    })

    setShowForm(true)
  }


  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  function openEditForm(task) {
    setEditingTask(task)

    setForm({
      title:
        task.title || "",

      course:
        task.course ||
        "Vocal Training",

      instructions:
        task.instructions ||
        "",

      dueDate:
        task.dueDate
          ? String(
              task.dueDate
            ).slice(0, 10)
          : "",

      assignedStudentId:
        task.assignedStudentId ||
        ""
    })

    setShowForm(true)
  }


  // =====================================================
  // CLOSE FORM
  // =====================================================

  function closeForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingTask(null)
  }


  // =====================================================
  // SAVE TASK
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      alert(
        "Please enter the task title."
      )
      return
    }

    if (!form.instructions.trim()) {
      alert(
        "Please enter task instructions."
      )
      return
    }

    const taskData = {
      title:
        form.title.trim(),

      course:
        form.course,

      instructions:
        form.instructions.trim(),

      dueDate:
        form.dueDate || "",

      assignedStudentId:
        form.assignedStudentId ||
        ""
    }

    try {
      setSaving(true)

      let response

      // UPDATE
      if (editingTask) {
        const taskId =
          getTaskId(editingTask)

        if (!taskId) {
          alert(
            "Task ID is missing."
          )
          return
        }

        response =
          await fetch(
            `${TASKS_API}/${taskId}`,
            {
              method: "PUT",
              headers:
                getAuthHeaders(),
              body:
                JSON.stringify(
                  taskData
                )
            }
          )
      }

      // ADD
      else {
        response =
          await fetch(
            TASKS_API,
            {
              method: "POST",
              headers:
                getAuthHeaders(),
              body:
                JSON.stringify(
                  taskData
                )
            }
          )
      }

      const data =
        await response.json()

      console.log(
        "Save task:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "You are not authorized to manage tasks."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save task."
        )
      }

      alert(
        editingTask
          ? "Task updated successfully! ✅"
          : "Task added successfully! ✅"
      )

      closeForm()

      await loadTasks()

      window.dispatchEvent(
        new Event("tasksUpdated")
      )
    } catch (error) {
      console.error(
        "Task save error:",
        error
      )

      alert(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setSaving(false)
    }
  }


  // =====================================================
  // DELETE TASK
  // =====================================================

  async function deleteTask(task) {
    const taskId =
      getTaskId(task)

    if (!taskId) {
      alert(
        "Task ID is missing."
      )
      return
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${task.title}"?\n\nThis action cannot be undone.`
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(
        String(taskId)
      )

      const response =
        await fetch(
          `${TASKS_API}/${taskId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "You are not authorized to delete tasks."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete task."
        )
      }

      setTasks(
        currentTasks =>
          currentTasks.filter(
            currentTask =>
              String(
                getTaskId(
                  currentTask
                )
              ) !==
              String(taskId)
          )
      )

      alert(
        "Task deleted successfully. ✅"
      )

      window.dispatchEvent(
        new Event("tasksUpdated")
      )
    } catch (error) {
      console.error(
        "Task deletion error:",
        error
      )

      alert(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setDeletingId("")
    }
  }


  // =====================================================
  // GET STUDENT NAME
  // =====================================================

  function getStudentName(
    studentId
  ) {
    if (!studentId) {
      return "All Students"
    }

    const student =
      students.find(
        item =>
          String(
            getStudentId(item)
          ) ===
          String(studentId)
      )

    return student
      ? student.name
      : "Student"
  }


  // =====================================================
  // GET TASK PROGRESS
  // =====================================================

  function getTaskProgress(task) {
    const taskId =
      getTaskId(task)

    const matchingProgress =
      progress.filter(
        item =>
          String(
            item.taskId
          ) === String(taskId)
      )

    if (
      matchingProgress.length === 0
    ) {
      return {
        total: 0,
        completed: 0,
        percentage: 0
      }
    }

    const completed =
      matchingProgress.filter(
        item =>
          Number(
            item.progress ||
            item.percentage ||
            0
          ) >= 100
      ).length

    const total =
      matchingProgress.length

    return {
      total,
      completed,
      percentage:
        total > 0
          ? Math.round(
              (completed / total) *
                100
            )
          : 0
    }
  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTasks =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase()

      if (!searchText) {
        return tasks
      }

      return tasks.filter(
        task => {
          const title =
            String(
              task.title || ""
            ).toLowerCase()

          const course =
            String(
              task.course || ""
            ).toLowerCase()

          const instructions =
            String(
              task.instructions || ""
            ).toLowerCase()

          const studentName =
            String(
              task.assignedStudentName ||
              getStudentName(
                task.assignedStudentId
              ) ||
              ""
            ).toLowerCase()

          return (
            title.includes(
              searchText
            ) ||
            course.includes(
              searchText
            ) ||
            instructions.includes(
              searchText
            ) ||
            studentName.includes(
              searchText
            )
          )
        }
      )
    }, [tasks, search, students])


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date) {
    if (!date) {
      return "No due date"
    }

    const parsed =
      new Date(date)

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return String(date)
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    )
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-tasks-page">

      {/* HEADER */}

      <div className="admin-students-header">

        <div>

          <p className="admin-label">
            ADMIN PANEL
          </p>

          <h1>
            Manage Tasks 📝
          </h1>

          <span>
            Create and manage learning tasks
            for Tantra Academy students.
          </span>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => {
              loadTasks()
              loadStudents()
              loadProgress()
            }}
            disabled={
              loading ||
              studentLoading
            }
          >
            {loading
              ? "⏳ Loading..."
              : "🔄 Refresh"}
          </button>

          <button
            type="button"
            className="admin-add-song-btn"
            onClick={openAddForm}
          >
            ＋ Add Task
          </button>

        </div>

      </div>


      {/* TOTAL TASKS */}

      <div className="admin-student-count">

        <div className="admin-count-icon">
          📝
        </div>

        <div>

          <p>
            Total Tasks
          </p>

          <h2>
            {tasks.length}
          </h2>

        </div>

      </div>


      {/* TASK CARD */}

      <div className="admin-students-card">

        <div className="admin-students-card-header">

          <div>

            <h2>
              Academy Tasks
            </h2>

            <p>
              Tasks stored in MongoDB
            </p>

          </div>

        </div>


        {/* SEARCH */}

        <div
          style={{
            padding:
              "0 20px 20px"
          }}
        >

          <input
            type="text"
            value={search}
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
            placeholder="🔍 Search task, course or student..."
            style={{
              width: "100%",
              maxWidth: "450px",
              minHeight: "44px",
              padding:
                "10px 14px",
              border:
                "1px solid #ddd",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px"
            }}
          />

        </div>


        {/* LOADING */}

        {loading && (

          <div className="admin-loading">

            <div
              style={{
                fontSize: "28px",
                marginBottom: "10px"
              }}
            >
              ⏳
            </div>

            Loading tasks...

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="admin-error">

              {error}

              <button
                type="button"
                onClick={loadTasks}
                style={{
                  marginLeft:
                    "12px"
                }}
              >
                Retry
              </button>

            </div>

          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          tasks.length === 0 && (

            <div className="admin-empty">

              <div>
                📝
              </div>

              <h3>
                No tasks found
              </h3>

              <p>
                Add your first task using
                the button above.
              </p>

            </div>

          )}


        {/* SEARCH EMPTY */}

        {!loading &&
          !error &&
          tasks.length > 0 &&
          filteredTasks.length === 0 && (

            <div className="admin-empty">

              <div>
                🔍
              </div>

              <h3>
                No matching tasks
              </h3>

              <p>
                Try another task title,
                course or student.
              </p>

            </div>

          )}


        {/* TASK TABLE */}

        {!loading &&
          !error &&
          filteredTasks.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-students-table">

                <thead>

                  <tr>

                    <th>#</th>
                    <th>Task</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Assigned To</th>
                    <th>Progress</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTasks.map(
                    (task, index) => {

                      const taskId =
                        getTaskId(task)

                      const taskProgress =
                        getTaskProgress(
                          task
                        )

                      return (

                        <tr
                          key={
                            taskId ||
                            index
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>


                          {/* TASK */}

                          <td>

                            <div
                              className="student-name"
                            >

                              <div
                                className="student-avatar"
                              >
                                📝
                              </div>

                              <div>

                                <strong>
                                  {task.title ||
                                    "Untitled Task"}
                                </strong>

                                <div
                                  style={{
                                    fontSize:
                                      "12px",
                                    color:
                                      "#777",
                                    marginTop:
                                      "4px"
                                  }}
                                >
                                  {task.instructions ||
                                    "No instructions"}
                                </div>

                              </div>

                            </div>

                          </td>


                          {/* COURSE */}

                          <td>
                            {task.course ||
                              "—"}
                          </td>


                          {/* DUE DATE */}

                          <td>
                            {formatDate(
                              task.dueDate
                            )}
                          </td>


                          {/* ASSIGNED */}

                          <td>

                            <span
                              className={
                                task.assignedStudentId
                                  ? "admin-student-assigned"
                                  : "admin-student-all"
                              }
                            >

                              {task.assignedStudentId
                                ? `👤 ${
                                    task.assignedStudentName ||
                                    getStudentName(
                                      task.assignedStudentId
                                    )
                                  }`
                                : "👥 All Students"}

                            </span>

                          </td>


                          {/* PROGRESS */}

                          <td>

                            {progressLoading ? (

                              <span>
                                Loading...
                              </span>

                            ) : (

                              <div
                                style={{
                                  minWidth:
                                    "120px"
                                }}
                              >

                                <div
                                  style={{
                                    fontSize:
                                      "13px",
                                    fontWeight:
                                      "700",
                                    marginBottom:
                                      "5px"
                                  }}
                                >
                                  {taskProgress.completed}
                                  /
                                  {taskProgress.total}
                                  {" "}
                                  Completed
                                </div>

                                <div
                                  style={{
                                    height:
                                      "8px",
                                    background:
                                      "#eee",
                                    borderRadius:
                                      "10px",
                                    overflow:
                                      "hidden"
                                  }}
                                >

                                  <div
                                    style={{
                                      width:
                                        `${taskProgress.percentage}%`,
                                      height:
                                        "100%",
                                      background:
                                        "#7c3aed",
                                      borderRadius:
                                        "10px"
                                    }}
                                  />

                                </div>

                                <small>
                                  {
                                    taskProgress.percentage
                                  }%
                                </small>

                              </div>

                            )}

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div
                              style={{
                                display:
                                  "flex",
                                gap:
                                  "8px",
                                flexWrap:
                                  "wrap"
                              }}
                            >

                              <button
                                type="button"
                                className="admin-edit-btn"
                                onClick={() =>
                                  openEditForm(
                                    task
                                  )
                                }
                              >
                                ✏ Edit
                              </button>

                              <button
                                type="button"
                                className="admin-delete-btn"
                                onClick={() =>
                                  deleteTask(
                                    task
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  String(
                                    taskId
                                  )
                                }
                              >
                                {deletingId ===
                                String(
                                  taskId
                                )
                                  ? "⏳ Deleting..."
                                  : "🗑 Delete"}
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>


      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div
          className="admin-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="admin-song-modal"
            onClick={event =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>

                <p className="admin-label">
                  {editingTask
                    ? "EDIT TASK"
                    : "NEW TASK"}
                </p>

                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Add New Task"}
                </h2>

              </div>

              <button
                type="button"
                className="admin-close-btn"
                onClick={closeForm}
                disabled={saving}
              >
                ✕
              </button>

            </div>


            <form
              className="admin-song-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* TITLE */}

              <div className="admin-form-group">

                <label>
                  Task Title *
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Example: Practice Sa Re Ga Ma"
                  value={form.title}
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* COURSE */}

              <div className="admin-form-group">

                <label>
                  Course / Category
                </label>

                <select
                  name="course"
                  value={form.course}
                  onChange={
                    handleChange
                  }
                >

                  <option value="Vocal Training">
                    Vocal Training
                  </option>

                  <option value="Guitar">
                    Guitar
                  </option>

                  <option value="Piano">
                    Piano
                  </option>

                  <option value="Keyboard">
                    Keyboard
                  </option>

                  <option value="Music Theory">
                    Music Theory
                  </option>

                </select>

              </div>


              {/* STUDENT */}

              <div className="admin-form-group">

                <label>
                  Assign to Student
                </label>

                <select
                  name="assignedStudentId"
                  value={
                    form.assignedStudentId
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    All Students
                  </option>

                  {studentLoading ? (

                    <option disabled>
                      Loading students...
                    </option>

                  ) : (

                    students.map(
                      student => {

                        const studentId =
                          getStudentId(
                            student
                          )

                        return (

                          <option
                            key={
                              studentId
                            }
                            value={
                              studentId
                            }
                          >
                            {student.name}
                            {" — "}
                            {student.email}
                          </option>

                        )
                      }
                    )

                  )}

                </select>

              </div>


              {/* DUE DATE */}

              <div className="admin-form-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={
                    form.dueDate
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* INSTRUCTIONS */}

              <div className="admin-form-group admin-form-full">

                <label>
                  Task Instructions *
                </label>

                <textarea
                  name="instructions"
                  placeholder="Example: Practice the song for 30 minutes and submit your recording."
                  value={
                    form.instructions
                  }
                  onChange={
                    handleChange
                  }
                  rows="6"
                  required
                />

              </div>


              {/* INFO */}

              <div className="admin-automatic-info">

                <strong>
                  🔔 Student Notification
                </strong>

                <p>
                  When the task is saved,
                  the backend automatically
                  creates a notification for
                  the assigned student.
                </p>

              </div>


              {/* BUTTONS */}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-song-btn"
                  disabled={saving}
                >
                  {saving
                    ? "⏳ Saving..."
                    : editingTask
                      ? "💾 Update Task"
                      : "💾 Save Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminTasks