
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Tasks() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [taskProgress, setTaskProgress] = useState([])


  function loadTaskData() {

    const savedTasks =
      JSON.parse(
        localStorage.getItem("tantraTasks")
      ) || []

    const savedProgress =
      JSON.parse(
        localStorage.getItem(
          "tantraTaskProgress"
        )
      ) || []

    setTasks(savedTasks)
    setTaskProgress(savedProgress)
  }


  useEffect(() => {

    loadTaskData()

    window.addEventListener(
      "storage",
      loadTaskData
    )

    window.addEventListener(
      "tasksUpdated",
      loadTaskData
    )

    window.addEventListener(
      "taskProgressUpdated",
      loadTaskData
    )

    return () => {

      window.removeEventListener(
        "storage",
        loadTaskData
      )

      window.removeEventListener(
        "tasksUpdated",
        loadTaskData
      )

      window.removeEventListener(
        "taskProgressUpdated",
        loadTaskData
      )

    }

  }, [])


  function markComplete(taskId) {

    const existingProgress =
      taskProgress.filter(
        (progress) =>
          String(progress.taskId) !==
          String(taskId)
      )

    const newProgress = {
      id: Date.now(),
      taskId: taskId,
      studentName: "Student",
      progress: 100,
      status: "Completed",
      completedAt:
        new Date().toLocaleDateString()
    }

    const updatedProgress = [
      ...existingProgress,
      newProgress
    ]

    setTaskProgress(updatedProgress)

    localStorage.setItem(
      "tantraTaskProgress",
      JSON.stringify(updatedProgress)
    )


    // Update Teacher Tasks page
    window.dispatchEvent(
      new Event("taskProgressUpdated")
    )


    // Create notification for teacher
    const existingNotifications =
      JSON.parse(
        localStorage.getItem(
          "tantraTeacherNotifications"
        )
      ) || []

    const completedTask =
      tasks.find(
        (task) =>
          String(task.id) ===
          String(taskId)
      )

    if (completedTask) {

      const newNotification = {
        id: Date.now() + 1,
        icon: "✅",
        title: "Task completed",
        message:
          `Student completed "${completedTask.title}".`,
        type: "Task",
        time: "Just now",
        unread: true
      }

      const updatedNotifications = [
        newNotification,
        ...existingNotifications
      ]

      localStorage.setItem(
        "tantraTeacherNotifications",
        JSON.stringify(
          updatedNotifications
        )
      )

      window.dispatchEvent(
        new Event("notificationsUpdated")
      )

    }


    alert(
      "Task completed! 🎉"
    )
  }


  function isTaskCompleted(taskId) {

    return taskProgress.some(
      (progress) =>
        String(progress.taskId) ===
          String(taskId) &&
        progress.studentName ===
          "Student" &&
        progress.status ===
          "Completed"
    )
  }


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
            Complete the practice tasks given
            by your teacher.
          </span>

        </div>

        <div className="task-count">

          {tasks.length} Tasks

        </div>

      </div>


      {tasks.length === 0 ? (

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

      ) : (

        <div className="tasks-grid">

          {tasks.map((task) => {

            const completed =
              isTaskCompleted(task.id)

            return (

              <div
                className="task-card"
                key={task.id}
              >

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


                <h2>
                  {task.title}
                </h2>


                <p className="task-course">

                  🎵 {task.course}

                </p>


                <div className="task-due-date">

                  📅 Due: {task.dueDate}

                </div>


                <div className="task-instructions">

                  <strong>
                    Instructions
                  </strong>

                  <p>
                    {task.instructions ||
                      "Practice according to your teacher's instructions."}
                  </p>

                </div>


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
                      markComplete(task.id)
                    }
                  >
                    Mark Task Complete ✅
                  </button>

                )}

              </div>

            )

          })}

        </div>

      )}


      <button
        className="tasks-back-btn"
        onClick={() =>
          navigate("/student-dashboard")
        }
      >
        ← Back to Dashboard
      </button>

    </div>
  )
}

export default Tasks
