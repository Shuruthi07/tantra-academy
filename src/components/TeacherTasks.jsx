import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function TeacherTasks() {

  const [tasks, setTasks] = useState([])
  const [taskProgress, setTaskProgress] = useState([])


  function loadTaskData() {

    const savedTasks =
      JSON.parse(
        localStorage.getItem("tantraTasks")
      ) || []

    const savedProgress =
      JSON.parse(
        localStorage.getItem("tantraTaskProgress")
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


  function getTaskProgress(taskId) {

    return taskProgress.find(
      (progress) =>
        String(progress.taskId) === String(taskId) &&
        progress.studentName === "Student"
    )

  }


  function deleteTask(taskId) {

    const task = tasks.find(
      (item) => item.id === taskId
    )

    const confirmed = window.confirm(
      `Delete "${task?.title || "this task"}"?`
    )

    if (!confirmed) {
      return
    }

    const updatedTasks =
      tasks.filter(
        (task) => task.id !== taskId
      )

    setTasks(updatedTasks)

    localStorage.setItem(
      "tantraTasks",
      JSON.stringify(updatedTasks)
    )

    window.dispatchEvent(
      new Event("tasksUpdated")
    )

  }


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
            Create and monitor practice tasks
            for your students.
          </span>

        </div>

      </div>


      <Link
        to="/teacher-dashboard"
        className="teacher-tasks-back"
      >
        Back to Dashboard
      </Link>


      {tasks.length === 0 ? (

        <div className="no-teacher-tasks">

          <div>
            ✅
          </div>

          <h2>
            No tasks created yet
          </h2>

          <p>
            Create a task from the Teacher Dashboard.
          </p>

        </div>

      ) : (

        <div className="teacher-tasks-list">

          {tasks.map((task) => {

            const progress =
              getTaskProgress(task.id)

            const completed =
              progress?.status === "Completed"

            const progressValue =
              progress?.progress || 0

            return (

              <div
                className="teacher-task-card"
                key={task.id}
              >

                <div className="teacher-task-top">

                  <div className="teacher-task-icon">
                    ✅
                  </div>

                  <div>

                    <h2>
                      {task.title}
                    </h2>

                    <p>
                      🎵 {task.course}
                    </p>

                  </div>

                </div>


                <div className="teacher-task-details">

                  <div>

                    <span>
                      Due Date
                    </span>

                    <strong>
                      📅 {task.dueDate}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Student Status
                    </span>

                    <strong
                      className={
                        completed
                          ? "teacher-task-done"
                          : "teacher-task-pending"
                      }
                    >

                      {completed
                        ? "✓ Student Completed"
                        : progress
                        ? `${progressValue}% In Progress`
                        : "Pending"}

                    </strong>

                  </div>

                </div>


                <div className="teacher-task-instructions">

                  <strong>
                    Instructions
                  </strong>

                  <p>
                    {task.instructions ||
                      "No instructions added."}
                  </p>

                </div>


                {progress && !completed && (

                  <div className="teacher-task-progress">

                    <div className="teacher-task-progress-header">

                      <span>
                        Student Progress
                      </span>

                      <strong>
                        {progressValue}%
                      </strong>

                    </div>


                    <div className="teacher-task-progress-bar">

                      <div
                        style={{
                          width: `${progressValue}%`
                        }}
                      ></div>

                    </div>

                  </div>

                )}


                <button
                  className="delete-task-btn"
                  onClick={() =>
                    deleteTask(task.id)
                  }
                >
                  🗑️ Delete Task
                </button>

              </div>

            )

          })}

        </div>

      )}

    </div>

  )

}

export default TeacherTasks