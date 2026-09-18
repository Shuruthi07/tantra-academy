import { useEffect, useState } from "react"

function TeacherSongProgress() {

  const [songs, setSongs] = useState([])
  const [progressList, setProgressList] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)


  // =========================================
  // LOAD DATA
  // =========================================

  function loadProgressData() {

    const savedSongs =
      JSON.parse(
        localStorage.getItem("tantraSongs")
      ) || []

    const savedProgress =
      JSON.parse(
        localStorage.getItem(
          "tantraStudentProgress"
        )
      ) || []

    setSongs(savedSongs)
    setProgressList(savedProgress)

  }


  // =========================================
  // LIVE UPDATE
  // =========================================

  useEffect(() => {

    loadProgressData()

    window.addEventListener(
      "storage",
      loadProgressData
    )

    window.addEventListener(
      "songsUpdated",
      loadProgressData
    )

    window.addEventListener(
      "progressUpdated",
      loadProgressData
    )

    return () => {

      window.removeEventListener(
        "storage",
        loadProgressData
      )

      window.removeEventListener(
        "songsUpdated",
        loadProgressData
      )

      window.removeEventListener(
        "progressUpdated",
        loadProgressData
      )

    }

  }, [])


  // =========================================
  // GET STUDENTS FOR SONG
  // =========================================

  function getSongStudents(songId) {

    return progressList.filter(
      (item) =>
        String(item.songId) ===
        String(songId)
    )

  }


  // =========================================
  // GET PROGRESS
  // =========================================

  function getProgress(student) {

    return Math.min(
      100,
      Math.max(
        0,
        Number(student.progress || 0)
      )
    )

  }


  // =========================================
  // GET STATUS
  // =========================================

  function getStatus(student) {

    const progress =
      getProgress(student)

    if (progress >= 100) {
      return "Completed"
    }

    if (progress > 0) {
      return "Learning"
    }

    return "Not Started"

  }


  // =========================================
  // GET COMPLETED COUNT
  // =========================================

  function getCompletedCount(songId) {

    return getSongStudents(songId).filter(
      (student) =>
        getProgress(student) >= 100
    ).length

  }


  return (

    <div className="teacher-progress-page">

      {/* =================================
          HEADER
      ================================= */}

      <div className="teacher-progress-header">

        <div>

          <p>
            LEARNING PROGRESS
          </p>

          <h1>
            Song Progress 📊
          </h1>

          <span>
            Track how your students are learning
            and practicing songs.
          </span>

        </div>

      </div>


      {/* =================================
          SONGS
      ================================= */}

      {songs.length === 0 ? (

        <div className="no-progress-songs">

          <div>
            🎵
          </div>

          <h2>
            No songs available
          </h2>

          <p>
            Publish a song first to track
            student progress.
          </p>

        </div>

      ) : (

        <div className="progress-song-grid">

          {songs.map((song) => {

            const students =
              getSongStudents(song.id)

            const completed =
              getCompletedCount(song.id)

            return (

              <div
                className="progress-song-card"
                key={song.id}
              >

                {/* SONG INFORMATION */}

                <div className="progress-song-top">

                  <div className="progress-song-icon">
                    🎵
                  </div>

                  <div>

                    <h2>
                      {song.title}
                    </h2>

                    {song.artist && (

                      <span className="progress-song-artist">
                        {song.artist}
                      </span>

                    )}

                    <p>
                      {song.course ||
                        song.category ||
                        "Music"}

                      {" · "}

                      {song.difficulty ||
                        "Easy"}
                    </p>

                  </div>

                </div>


                {/* STATISTICS */}

                <div className="progress-stat">

                  <div>

                    <span>
                      Students Practiced
                    </span>

                    <strong>
                      {students.length}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Completed
                    </span>

                    <strong>
                      {completed}
                    </strong>

                  </div>

                </div>


                {/* VIEW BUTTON */}

                <button
                  type="button"
                  className="view-progress-btn"
                  onClick={() =>
                    setSelectedSong(song)
                  }
                >
                  👥 View Students
                </button>

              </div>

            )

          })}

        </div>

      )}


      {/* =================================
          STUDENT PROGRESS MODAL
      ================================= */}

      {selectedSong && (

        <div
          className="teacher-progress-overlay"
          onClick={() =>
            setSelectedSong(null)
          }
        >

          <div
            className="teacher-progress-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="teacher-progress-close"
              onClick={() =>
                setSelectedSong(null)
              }
            >
              ✕
            </button>


            {/* SONG ICON */}

            <div className="progress-modal-icon">
              🎵
            </div>


            <h2>
              {selectedSong.title}
            </h2>


            {selectedSong.artist && (

              <span className="progress-modal-artist">
                {selectedSong.artist}
              </span>

            )}


            <p>
              Student Practice Progress
            </p>


            {/* STUDENT LIST */}

            <div className="student-progress-list">

              {getSongStudents(
                selectedSong.id
              ).length === 0 ? (

                <div className="no-student-progress">

                  <div>
                    👨‍🎓
                  </div>

                  <p>
                    No students have practiced
                    this song yet.
                  </p>

                </div>

              ) : (

                getSongStudents(
                  selectedSong.id
                ).map((student) => {

                  const progress =
                    getProgress(student)

                  const status =
                    getStatus(student)

                  return (

                    <div
                      className="student-progress-row"
                      key={student.id}
                    >

                      {/* STUDENT */}

                      <div className="progress-student-info">

                        <div className="progress-student-avatar">
                          👤
                        </div>

                        <div>

                          <strong>
                            {student.studentName || "Student"}
                          </strong>

                          <span>
                            {status}
                          </span>

                        </div>

                      </div>


                      {/* PROGRESS */}

                      <div className="student-progress-value">

                        <strong>
                          {progress}%
                        </strong>

                        <div className="student-progress-bar">

                          <div
                            style={{
                              width:
                                `${progress}%`
                            }}
                          ></div>

                        </div>

                      </div>


                      {/* STATUS */}

                      <span
                        className={
                          status === "Completed"
                            ? "progress-completed"
                            : status === "Learning"
                              ? "progress-learning"
                              : "progress-not-started"
                        }
                      >

                        {status === "Completed"
                          ? "✓ Completed"
                          : status === "Learning"
                            ? "Learning"
                            : "Not Started"}

                      </span>

                    </div>

                  )

                })

              )}

            </div>


            {/* CLOSE */}

            <button
              type="button"
              className="close-details-btn"
              onClick={() =>
                setSelectedSong(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  )

}

export default TeacherSongProgress