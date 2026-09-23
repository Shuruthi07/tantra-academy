import { useEffect, useMemo, useState } from "react"
import {
  Link,
  useSearchParams
} from "react-router-dom"


const TASK_API =
  "http://127.0.0.1:5000/api/admin/tasks"

const STUDENTS_API =
  "http://127.0.0.1:5000/api/admin/teacher-students"

const PROGRESS_API =
  "http://127.0.0.1:5000/api/task-progress"


function TeacherTasks() {

  const [searchParams, setSearchParams] =
    useSearchParams()

  const selectedStudentId =
    searchParams.get("studentId") || ""


  const [tasks, setTasks] =
    useState([])

  const [students, setStudents] =
    useState([])

  const [taskProgress, setTaskProgress] =
    useState([])

  const [selectedStudent, setSelectedStudent] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [showForm, setShowForm] =
    useState(false)

  const [editingTask, setEditingTask] =
    useState(null)

  const [form, setForm] =
    useState({
      title: "",
      course: "Vocal Training",
      instructions: "",
      dueDate: "",
      assignedStudentId: ""
    })


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
  // LOAD TASKS
  // =====================================================

  async function loadTasks() {

    try {

      const response =
        await fetch(
          TASK_API,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load tasks."
        )

      }

      setTasks(
        Array.isArray(
          data.tasks
        )
          ? data.tasks
          : []
      )

    } catch (error) {

      console.error(
        "Task loading error:",
        error
      )

      setTasks([])

      setError(
        error.message ||
        "Unable to load tasks from the database."
      )

    }

  }


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  async function loadStudents() {

    try {

      const response =
        await fetch(
          STUDENTS_API,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load students."
        )

      }

      const studentList =
        Array.isArray(
          data.students
        )
          ? data.students
          : []

      setStudents(
        studentList
      )


      if (selectedStudentId) {

        const foundStudent =
          studentList.find(
            student =>
              String(
                student.id ||
                student._id
              ) ===
              String(
                selectedStudentId
              )
          )

        if (foundStudent) {

          setSelectedStudent({
            ...foundStudent,

            id:
              foundStudent.id ||
              foundStudent._id
          })

        }

      } else {

        setSelectedStudent(
          null
        )

      }

    } catch (error) {

      console.error(
        "Student loading error:",
        error
      )

      setStudents([])

      setSelectedStudent(
        null
      )

    }

  }


  // =====================================================
  // LOAD TASK PROGRESS
  // =====================================================

  async function loadTaskProgress() {

    try {

      const url =
        selectedStudentId
          ? `${PROGRESS_API}/?studentId=${encodeURIComponent(
              selectedStudentId
            )}`
          : `${PROGRESS_API}/`

      const response =
        await fetch(
          url,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load task progress."
        )

      }

      setTaskProgress(
        Array.isArray(
          data.progress
        )
          ? data.progress
          : []
      )

    } catch (error) {

      console.error(
        "Task progress loading error:",
        error
      )

      setTaskProgress([])

    }

  }


  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  async function loadData() {

    setLoading(true)
    setError("")

    await Promise.all([
      loadTasks(),
      loadStudents(),
      loadTaskProgress()
    ])

    setLoading(false)

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadData()


    function handleTasksUpdated() {
      loadTasks()
    }


    function handleTaskProgressUpdated() {
      loadTaskProgress()
    }


    window.addEventListener(
      "tasksUpdated",
      handleTasksUpdated
    )

    window.addEventListener(
      "taskProgressUpdated",
      handleTaskProgressUpdated
    )


    return () => {

      window.removeEventListener(
        "tasksUpdated",
        handleTasksUpdated
      )

      window.removeEventListener(
        "taskProgressUpdated",
        handleTaskProgressUpdated
      )

    }

  }, [
    selectedStudentId
  ])


  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(
    event
  ) {

    const {
      name,
      value
    } = event.target

    setForm(
      previous => ({
        ...previous,
        [name]: value
      })
    )

  }


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  function openAddForm() {

    setEditingTask(
      null
    )

    setForm({
      title: "",
      course: "Vocal Training",
      instructions: "",
      dueDate: "",

      assignedStudentId:
        selectedStudentId || ""
    })

    setShowForm(
      true
    )

  }


  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  function openEditForm(
    task
  ) {

    setEditingTask(
      task
    )

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
        task.dueDate ||
        "",

      assignedStudentId:
        task.assignedStudentId ||
        ""
    })

    setShowForm(
      true
    )

  }


  // =====================================================
  // CLOSE FORM
  // =====================================================

  function closeForm() {

    setShowForm(
      false
    )

    setEditingTask(
      null
    )

  }


  // =====================================================
  // SAVE TASK
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault()

    if (
      !form.title.trim()
    ) {

      alert(
        "Please enter the task title."
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
        form.dueDate,

      assignedStudentId:
        form.assignedStudentId ||
        ""

    }


    try {

      let response


      // =================================================
      // UPDATE
      // =================================================

      if (editingTask) {

        response =
          await fetch(
            `${TASK_API}/${editingTask.id}`,
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


      // =================================================
      // CREATE
      // =================================================

      else {

        response =
          await fetch(
            TASK_API,
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


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to save task."
        )

        return

      }


      alert(
        editingTask
          ? "Task updated successfully! ✅"
          : "Task created successfully! ✅"
      )


      closeForm()


      await loadTasks()


      window.dispatchEvent(
        new Event(
          "tasksUpdated"
        )
      )

    } catch (error) {

      console.error(
        "Task save error:",
        error
      )

      alert(
        "Unable to connect to the backend."
      )

    }

  }


  // =====================================================
  // DELETE TASK
  // =====================================================

  async function deleteTask(
    taskId
  ) {

    const task =
      tasks.find(
        item =>
          String(
            item.id
          ) ===
          String(
            taskId
          )
      )


    const confirmed =
      window.confirm(
        `Delete "${
          task?.title ||
          "this task"
        }"?`
      )


    if (!confirmed) {
      return
    }


    try {

      const response =
        await fetch(
          `${TASK_API}/${taskId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders()
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to delete task."
        )

        return

      }


      alert(
        "Task deleted successfully."
      )


      await loadTasks()
      await loadTaskProgress()


      window.dispatchEvent(
        new Event(
          "tasksUpdated"
        )
      )

    } catch (error) {

      console.error(
        "Task delete error:",
        error
      )

      alert(
        "Unable to connect to the backend."
      )

    }

  }


  // =====================================================
  // GET TASK PROGRESS
  // =====================================================

  function getTaskProgress(
    taskId
  ) {

    const matchingProgress =
      taskProgress.filter(
        progress =>
          String(
            progress.taskId
          ) ===
          String(
            taskId
          )
      )


    if (
      matchingProgress.length ===
      0
    ) {

      return null

    }


    return matchingProgress

  }


  // =====================================================
  // GET STUDENT NAME
  // =====================================================

  function getStudentName(
    task
  ) {

    if (
      selectedStudentId &&
      selectedStudent &&
      (
        !task.assignedStudentId ||
        String(
          task.assignedStudentId
        ) ===
        String(
          selectedStudentId
        )
      )
    ) {

      return selectedStudent.name

    }


    if (
      task.assignedStudentName
    ) {

      return task.assignedStudentName

    }


    if (
      task.assignedStudentId
    ) {

      const student =
        students.find(
          item =>
            String(
              item.id
            ) ===
            String(
              task.assignedStudentId
            )
        )


      if (student) {

        return student.name

      }


      return "Assigned Student"

    }


    return "All Students"

  }


  // =====================================================
  // GET STATUS
  // =====================================================

  function getTaskStatus(
    task
  ) {

    const progressList =
      getTaskProgress(
        task.id
      )


    if (
      !progressList ||
      progressList.length === 0
    ) {

      return {
        completed: false,
        progress: 0,
        text: "Pending"
      }

    }


    const completedStudent =
      progressList.find(
        item =>
          item.status ===
          "Completed"
      )


    if (completedStudent) {

      return {
        completed: true,
        progress: 100,

        text:
          selectedStudentId
            ? "✓ Completed"
            : `✓ ${
                completedStudent.studentName ||
                "Student"
              } Completed`
      }

    }


    const latest =
      progressList[0]


    const progress =
      Number(
        latest.progress ||
        0
      )


    return {

      completed: false,

      progress,

      text:
        `${progress}% In Progress`

    }

  }


  // =====================================================
  // FILTER TASKS FOR SELECTED STUDENT
  // =====================================================

  const visibleTasks =
    useMemo(() => {

      if (
        !selectedStudentId
      ) {

        return tasks

      }


      return tasks.filter(
        task => {

          /*
           * Specifically assigned
           * to selected student.
           */

          if (
            task.assignedStudentId &&
            String(
              task.assignedStudentId
            ) ===
            String(
              selectedStudentId
            )
          ) {

            return true

          }


          /*
           * Tasks assigned to all students
           * should also be visible.
           */

          if (
            !task.assignedStudentId
          ) {

            return true

          }


          /*
           * If progress exists for this
           * selected student, show task.
           */

          const hasProgress =
            taskProgress.some(
              progress =>
                String(
                  progress.taskId
                ) ===
                String(
                  task.id
                )
            )

          if (hasProgress) {

            return true

          }


          return false

        }
      )

    }, [
      tasks,
      taskProgress,
      selectedStudentId
    ])


  // =====================================================
  // SHOW ALL STUDENTS
  // =====================================================

  function showAllStudents() {

    setSearchParams({})

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="teacher-tasks-page">

        <div className="teacher-tasks-header">

          <div>

            <p>
              TASK MANAGEMENT
            </p>

            <h1>
              Practice Tasks ✅
            </h1>

            <span>
              Loading tasks...
            </span>

          </div>

        </div>


        <div className="no-teacher-tasks">

          <div>
            ⏳
          </div>

          <h2>
            Loading tasks...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="teacher-tasks-page">


      {/* HEADER */}

      <div className="teacher-tasks-header">

        <div>

          <p>
            TASK MANAGEMENT
          </p>

          <h1>
            Practice Tasks ✅
          </h1>

          <span>
            {selectedStudentId
              ? `Practice tasks for ${
                  selectedStudent?.name ||
                  "selected student"
                }.`
              : "Create and monitor practice tasks for your students."}
          </span>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >

          {selectedStudentId && (

            <button
              type="button"
              className="teacher-task-cancel-btn"
              onClick={
                showAllStudents
              }
            >
              👥 View All Students
            </button>

          )}


          <button
            type="button"
            className="teacher-add-task-btn"
            onClick={
              openAddForm
            }
          >
            + Create Task
          </button>

        </div>

      </div>


      {/* SELECTED STUDENT BANNER */}

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
              {selectedStudent?.name ||
                "Student"}
            </span>

          </div>


          <strong
            style={{
              color: "#7c3aed"
            }}
          >
            {visibleTasks.length} task
            {visibleTasks.length !== 1
              ? "s"
              : ""}
          </strong>

        </div>

      )}


      {/* BACK */}

      {!selectedStudentId && (

        <Link
          to="/teacher-dashboard"
          className="teacher-tasks-back"
        >
          ← Back to Dashboard
        </Link>

      )}


      {/* ERROR */}

      {error && (

        <div className="login-error">

          {error}

          <button
            type="button"
            onClick={
              loadData
            }
            style={{
              marginLeft: "12px"
            }}
          >
            🔄 Retry
          </button>

        </div>

      )}


      {/* ADD / EDIT FORM */}

      {showForm && (

        <div className="teacher-task-form-card">

          <div className="teacher-task-form-header">

            <div>

              <p>
                {editingTask
                  ? "EDIT TASK"
                  : "NEW TASK"}
              </p>

              <h2>

                {editingTask
                  ? "Edit Practice Task"
                  : "Create Practice Task"}

              </h2>

            </div>


            <button
              type="button"
              className="teacher-task-close"
              onClick={
                closeForm
              }
            >
              ✕
            </button>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="teacher-task-form"
          >


            {/* TASK TITLE */}

            <div className="teacher-task-form-group">

              <label>
                Task Title *
              </label>

              <input
                type="text"
                name="title"
                placeholder="Example: Practice Chorus"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            {/* COURSE */}

            <div className="teacher-task-form-group">

              <label>
                Course
              </label>

              <select
                name="course"
                value={
                  form.course
                }
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

            <div className="teacher-task-form-group">

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


                {students.map(
                  student => (

                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >

                      {student.name}
                      {" — "}
                      {student.email}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* DUE DATE */}

            <div className="teacher-task-form-group">

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

            <div className="teacher-task-form-group teacher-task-form-full">

              <label>
                Instructions
              </label>

              <textarea
                name="instructions"
                placeholder="Example: Practice the chorus 5 times..."
                value={
                  form.instructions
                }
                onChange={
                  handleChange
                }
                rows="5"
              />

            </div>


            {/* BUTTONS */}

            <div className="teacher-task-form-actions">

              <button
                type="button"
                className="teacher-task-cancel-btn"
                onClick={
                  closeForm
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="teacher-task-save-btn"
              >

                {editingTask
                  ? "💾 Update Task"
                  : "✅ Create Task"}

              </button>

            </div>

          </form>

        </div>

      )}


      {/* TASK LIST */}

      {visibleTasks.length === 0 ? (

        <div className="no-teacher-tasks">

          <div>
            📝
          </div>

          <h2>

            {selectedStudentId
              ? "No tasks found for this student"
              : "No tasks created yet"}

          </h2>

          <p>

            {selectedStudentId
              ? "This student has no assigned or active practice tasks yet."
              : "Create your first practice task using the button above."}

          </p>


          {!selectedStudentId && (

            <button
              type="button"
              className="teacher-task-create-empty-btn"
              onClick={
                openAddForm
              }
            >
              + Create Your First Task
            </button>

          )}

        </div>

      ) : (

        <div className="teacher-tasks-list">

          {visibleTasks.map(
            task => {

              const progressList =
                getTaskProgress(
                  task.id
                )


              const status =
                getTaskStatus(
                  task
                )


              return (

                <div
                  className="teacher-task-card"
                  key={
                    task.id
                  }
                >


                  {/* TASK TOP */}

                  <div className="teacher-task-top">

                    <div className="teacher-task-icon">
                      ✅
                    </div>


                    <div>

                      <h2>
                        {task.title}
                      </h2>

                      <p>
                        🎵{" "}
                        {task.course ||
                          "Music"}
                      </p>

                    </div>

                  </div>


                  {/* ASSIGNED STUDENT */}

                  <div className="teacher-task-assigned">

                    <span>
                      Assigned To
                    </span>

                    <strong>
                      👤{" "}
                      {getStudentName(
                        task
                      )}
                    </strong>

                  </div>


                  {/* DETAILS */}

                  <div className="teacher-task-details">

                    <div>

                      <span>
                        Due Date
                      </span>

                      <strong>

                        {task.dueDate
                          ? `📅 ${task.dueDate}`
                          : "No due date"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Student Status
                      </span>

                      <strong
                        className={
                          status.completed
                            ? "teacher-task-done"
                            : "teacher-task-pending"
                        }
                      >

                        {status.text}

                      </strong>

                    </div>

                  </div>


                  {/* INSTRUCTIONS */}

                  <div className="teacher-task-instructions">

                    <strong>
                      Instructions
                    </strong>

                    <p>
                      {task.instructions ||
                        "No instructions added."}
                    </p>

                  </div>


                  {/* PROGRESS */}

                  <div className="teacher-task-progress">

                    <div className="teacher-task-progress-header">

                      <span>
                        Student Progress
                      </span>

                      <strong>
                        {status.progress}%
                      </strong>

                    </div>


                    <div className="teacher-task-progress-bar">

                      <div
                        style={{
                          width:
                            `${Math.min(
                              Math.max(
                                status.progress,
                                0
                              ),
                              100
                            )}%`
                        }}
                      />

                    </div>

                  </div>


                  {/* STUDENT PROGRESS DETAILS */}

                  {progressList &&
                    progressList.length > 0 && (

                      <div className="teacher-task-student-progress">

                        <strong>
                          Student Updates
                        </strong>


                        {progressList.map(
                          progress => (

                            <div
                              className="teacher-task-student-row"
                              key={
                                progress.id ||
                                `${progress.taskId}-${progress.studentId}`
                              }
                            >

                              <span>
                                👤{" "}
                                {selectedStudentId
                                  ? (
                                      selectedStudent?.name ||
                                      progress.studentName ||
                                      "Student"
                                    )
                                  : (
                                      progress.studentName ||
                                      "Student"
                                    )}
                              </span>

                              <span>

                                {progress.status ===
                                "Completed"

                                  ? "✅ Completed"

                                  : `${Number(
                                      progress.progress ||
                                      0
                                    )}%`}

                              </span>

                            </div>

                          )
                        )}

                      </div>

                    )}


                  {/* ACTIONS */}

                  <div className="teacher-task-actions">

                    <button
                      type="button"
                      className="teacher-task-edit-btn"
                      onClick={() =>
                        openEditForm(
                          task
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      type="button"
                      className="delete-task-btn"
                      onClick={() =>
                        deleteTask(
                          task.id
                        )
                      }
                    >
                      🗑️ Delete Task
                    </button>

                  </div>

                </div>

              )

            }
          )}

        </div>

      )}

    </div>

  )

}


export default TeacherTasks