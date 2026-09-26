import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


// =========================================================
// API
// =========================================================

const TASK_API =
  "https://tantra-academy-1.onrender.com/api/admin/tasks"

const PROGRESS_API =
  "https://tantra-academy-1.onrender.com/api/task-progress"

const NOTIFICATION_API =
  "https://tantra-academy-1.onrender.com/api/notifications"


// =========================================================
// TASKS COMPONENT
// =========================================================

function Tasks() {

  const navigate = useNavigate()


  const [tasks, setTasks] =
    useState([])

  const [taskProgress, setTaskProgress] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [progressLoading, setProgressLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  // =========================================================
  // GET AUTH HEADERS
  // =========================================================

  function getAuthHeaders() {

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    return {
      "Content-Type":
        "application/json",

      Authorization:
        "Bearer " + token
    }
  }


  // =========================================================
  // GET LOGGED-IN STUDENT
  // =========================================================

  function getLoggedInStudent() {

    try {

      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )


      if (storedUser) {

        return JSON.parse(
          storedUser
        )

      }

    } catch (error) {

      console.error(
        "Student session error:",
        error
      )

    }


    return null
  }


  // =========================================================
  // LOAD TASK PROGRESS
  // =========================================================

  async function loadProgress() {

    const student =
      getLoggedInStudent()


    const studentId =
      student?.id ||
      student?._id ||
      ""


    if (!studentId) {

      setTaskProgress([])

      return
    }


    try {

      const response =
        await fetch(
          `${PROGRESS_API}/?studentId=${encodeURIComponent(
            studentId
          )}`,
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
        "Task progress response:",
        data
      )


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


  // =========================================================
  // LOAD TASKS
  // =========================================================

  async function loadTasks() {

    try {

      setLoading(true)

      setError("")


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


      console.log(
        "Tasks API response:",
        data
      )


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load tasks."
        )
      }


      const allTasks =
        Array.isArray(
          data.tasks
        )
          ? data.tasks
          : []


      const student =
        getLoggedInStudent()


      const studentId =
        student?.id ||
        student?._id ||
        ""


      // =====================================================
      // SHOW:
      // 1. Tasks assigned to this student
      // 2. Tasks assigned to everyone
      // =====================================================

      const studentTasks =
        allTasks.filter(
          (task) => {

            const assignedId =
              task.assignedStudentId


            // Task is for everyone

            if (!assignedId) {

              return true

            }


            // Task is for this student

            return (
              String(
                assignedId
              ) ===
              String(
                studentId
              )
            )

          }
        )


      setTasks(
        studentTasks
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

    } finally {

      setLoading(false)

    }

  }


  // =========================================================
  // CREATE TEACHER NOTIFICATION
  // =========================================================

  async function createTeacherNotification(
    task,
    student
  ) {

    try {

      let teacherIds = []


      // -----------------------------------------------------
      // If task already contains teacherId
      // -----------------------------------------------------

      if (task?.teacherId) {

        teacherIds = [
          task.teacherId
        ]

      } else {

        // ---------------------------------------------------
        // Get teachers from backend
        // ---------------------------------------------------

        try {

          const response =
            await fetch(
              "https://tantra-academy-1.onrender.com/api/admin/teachers",
              {
                method: "GET",

                headers:
                  getAuthHeaders(),

                cache: "no-store"
              }
            )


          const data =
            await response.json()


          if (response.ok) {

            const teachers =
              Array.isArray(
                data.teachers
              )
                ? data.teachers
                : []


            teacherIds =
              teachers
                .map(
                  teacher =>
                    teacher.id ||
                    teacher._id
                )
                .filter(Boolean)

          }

        } catch (
          teacherError
        ) {

          console.error(
            "Teacher loading error:",
            teacherError
          )

        }

      }


      // -----------------------------------------------------
      // No teacher found
      // -----------------------------------------------------

      if (
        teacherIds.length === 0
      ) {

        console.warn(
          "No teacher found for task notification."
        )

        return
      }


      // -----------------------------------------------------
      // Send notification
      // -----------------------------------------------------

      for (
        const teacherId of teacherIds
      ) {

        try {

          const response =
            await fetch(
              NOTIFICATION_API,
              {
                method: "POST",

                headers:
                  getAuthHeaders(),

                body:
                  JSON.stringify({

                    userId:
                      String(
                        teacherId
                      ),

                    title:
                      "Task completed",

                    message:
                      `${student.name || "Student"} completed "${task.title}".`,

                    type:
                      "Task"

                  })
              }
            )


          const data =
            await response.json()


          if (!response.ok) {

            console.error(
              "Notification failed:",
              data.message
            )

          }

        } catch (
          notificationError
        ) {

          console.error(
            "Notification error:",
            notificationError
          )

        }

      }

    } catch (error) {

      console.error(
        "Teacher notification error:",
        error
      )

    }

  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadTasks()

    loadProgress()


    function handleTaskUpdate() {

      loadTasks()

    }


    function handleProgressUpdate() {

      loadProgress()

    }


    window.addEventListener(
      "tasksUpdated",
      handleTaskUpdate
    )


    window.addEventListener(
      "taskProgressUpdated",
      handleProgressUpdate
    )


    return () => {

      window.removeEventListener(
        "tasksUpdated",
        handleTaskUpdate
      )


      window.removeEventListener(
        "taskProgressUpdated",
        handleProgressUpdate
      )

    }

  }, [])


  // =========================================================
  // MARK TASK COMPLETE
  // =========================================================

  async function markComplete(
    taskId
  ) {

    const student =
      getLoggedInStudent()


    const studentId =
      student?.id ||
      student?._id ||
      ""


    if (!studentId) {

      alert(
        "Student login session not found. Please login again."
      )

      return
    }


    const alreadyCompleted =
      isTaskCompleted(
        taskId
      )


    if (alreadyCompleted) {

      return
    }


    setProgressLoading(true)


    try {

      // -----------------------------------------------------
      // FIND TASK
      // -----------------------------------------------------

      const completedTask =
        tasks.find(
          task =>
            String(
              task.id ||
              task._id
            ) ===
            String(
              taskId
            )
        )


      // -----------------------------------------------------
      // SAVE TASK PROGRESS
      // -----------------------------------------------------

      const response =
        await fetch(
          `${PROGRESS_API}/complete`,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({

                taskId:
                  String(
                    taskId
                  )

              })
          }
        )


      const data =
        await response.json()


      console.log(
        "Task completion response:",
        data
      )


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to complete task."
        )
      }


      // -----------------------------------------------------
      // RELOAD PROGRESS
      // -----------------------------------------------------

      await loadProgress()


      // -----------------------------------------------------
      // NOTIFY TEACHER
      // -----------------------------------------------------

      if (completedTask) {

        await createTeacherNotification(
          completedTask,
          student
        )

      }


      // -----------------------------------------------------
      // FRONTEND EVENTS
      // -----------------------------------------------------

      window.dispatchEvent(
        new Event(
          "taskProgressUpdated"
        )
      )


      window.dispatchEvent(
        new Event(
          "notificationsUpdated"
        )
      )


      alert(
        "Task completed! 🎉"
      )

    } catch (error) {

      console.error(
        "Task completion error:",
        error
      )


      alert(
        error.message ||
        "Unable to complete task."
      )

    } finally {

      setProgressLoading(false)

    }

  }


  // =========================================================
  // CHECK COMPLETED
  // =========================================================

  function isTaskCompleted(
    taskId
  ) {

    const student =
      getLoggedInStudent()


    const studentId =
      student?.id ||
      student?._id ||
      ""


    return taskProgress.some(
      progress => {

        return (

          String(
            progress.taskId
          ) ===
          String(
            taskId
          )

          &&

          String(
            progress.studentId
          ) ===
          String(
            studentId
          )

          &&

          (
            progress.status ===
            "Completed"
          )

        )

      }
    )

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="tasks-page">

        <div className="tasks-header">

          <div>

            <p>
              MY LEARNING
            </p>

            <h1>
              Practice Tasks ✅
            </h1>

            <span>
              Loading your practice tasks...
            </span>

          </div>

        </div>


        <div className="no-tasks">

          <div>
            ⏳
          </div>

          <h2>
            Loading tasks...
          </h2>

          <p>
            Please wait while your tasks are loaded.
          </p>

        </div>

      </div>

    )

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="tasks-page">


      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="tasks-header">

        <div>

          <p>
            MY LEARNING
          </p>

          <h1>
            Practice Tasks ✅
          </h1>

          <span>
            Complete the practice tasks given
            by your teacher.
          </span>

        </div>


        <div className="task-count">

          {tasks.length} Tasks

        </div>

      </div>


      {/* ===================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="login-error">

          {error}


          <button
            type="button"
            onClick={() => {

              loadTasks()

              loadProgress()

            }}
            style={{
              marginLeft:
                "12px"
            }}
          >
            🔄 Retry
          </button>

        </div>

      )}


      {/* ===================================================
          NO TASKS
      ==================================================== */}

      {!error &&
        tasks.length === 0 && (

          <div className="no-tasks">

            <div>
              ✅
            </div>

            <h2>
              No tasks yet
            </h2>

            <p>
              Your teacher has not assigned any
              practice tasks.
            </p>

          </div>

        )}


      {/* ===================================================
          TASK LIST
      ==================================================== */}

      {tasks.length > 0 && (

        <div className="tasks-grid">

          {tasks.map(
            task => {

              const taskId =
                task.id ||
                task._id


              const completed =
                isTaskCompleted(
                  taskId
                )


              return (

                <div
                  className="task-card"
                  key={taskId}
                >


                  {/* TOP */}

                  <div className="task-card-top">

                    <div className="task-icon">
                      ✅
                    </div>


                    <span
                      className={
                        completed
                          ? "task-completed"
                          : "task-pending"
                      }
                    >

                      {completed
                        ? "✓ Completed"
                        : "Pending"}

                    </span>

                  </div>


                  {/* TITLE */}

                  <h2>
                    {task.title}
                  </h2>


                  {/* COURSE */}

                  <p className="task-course">

                    🎵{" "}

                    {task.course ||
                      "Music"}

                  </p>


                  {/* ASSIGNED STUDENT */}

                  <div className="task-due-date">

                    👨‍🎓{" "}

                    {task.assignedStudentName
                      ? `Assigned to ${task.assignedStudentName}`
                      : "Assigned to all students"}

                  </div>


                  {/* DUE DATE */}

                  {task.dueDate && (

                    <div className="task-due-date">

                      📅 Due:{" "}

                      {task.dueDate}

                    </div>

                  )}


                  {/* INSTRUCTIONS */}

                  <div className="task-instructions">

                    <strong>
                      Instructions
                    </strong>

                    <p>

                      {task.instructions ||
                        "Practice according to your teacher's instructions."}

                    </p>

                  </div>


                  {/* COMPLETE BUTTON */}

                  {completed ? (

                    <button
                      className="task-completed-btn"
                      disabled
                    >
                      ✓ Task Completed
                    </button>

                  ) : (

                    <button
                      className="task-complete-btn"
                      onClick={() =>
                        markComplete(
                          taskId
                        )
                      }
                      disabled={
                        progressLoading
                      }
                    >

                      {progressLoading
                        ? "Saving..."
                        : "Mark Task Complete ✅"}

                    </button>

                  )}

                </div>

              )

            }
          )}

        </div>

      )}


      {/* ===================================================
          BACK BUTTON
      ==================================================== */}

      <button
        className="tasks-back-btn"
        onClick={() =>
          navigate(
            "/student-dashboard"
          )
        }
      >
        ← Back to Dashboard
      </button>


    </div>

  )

}


export default Tasks