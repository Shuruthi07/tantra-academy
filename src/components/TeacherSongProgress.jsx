import { useEffect, useState } from "react"


// ==================================================
// API
// ==================================================

const SONGS_API =
  "https://tantra-academy-1.onrender.com/api/admin/songs"


// IMPORTANT:
// Keep the trailing slash.
// This prevents the Flask redirect/CORS problem.
const PROGRESS_API =
  "https://tantra-academy-1.onrender.com/api/song-progress/"


// ==================================================
// COMPONENT
// ==================================================

function TeacherSongProgress() {

  const [songs, setSongs] =
    useState([])


  const [progressList, setProgressList] =
    useState([])


  const [selectedSong, setSelectedSong] =
    useState(null)


  const [loading, setLoading] =
    useState(true)


  const [error, setError] =
    useState("")


  // ==================================================
  // JWT HEADERS
  // ==================================================

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


  // ==================================================
  // GET SONG ID
  // ==================================================

  function getSongId(song) {

    return (
      song?.id ||
      song?._id ||
      ""
    )

  }


  // ==================================================
  // LOAD SONGS
  // ==================================================

  async function loadSongs(
    showError = true
  ) {

    try {

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )


      if (!token) {

        throw new Error(
          "Login session expired. Please login again."
        )

      }


      const response =
        await fetch(
          SONGS_API,
          {
            method: "GET",

            headers:
              getAuthHeaders(),

            cache:
              "no-store"
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load songs."
        )

      }


      const songList =
        Array.isArray(
          data.songs
        )
          ? data.songs
          : []


      setSongs(
        songList
      )


      if (showError) {

        setError("")

      }


      console.log(
        "Teacher Song Progress - Songs:",
        songList
      )


    } catch (error) {

      console.error(
        "Song loading error:",
        error
      )


      if (showError) {

        setSongs([])

        setError(
          error.message ||
          "Unable to load songs from the database."
        )

      }

    }

  }


  // ==================================================
  // LOAD STUDENT PROGRESS
  // ==================================================

  async function loadProgressData(
    showError = true
  ) {

    try {

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )


      if (!token) {

        throw new Error(
          "Login session expired. Please login again."
        )

      }


      // IMPORTANT:
      // PROGRESS_API ALREADY HAS /
      // DO NOT ADD ANOTHER /

      const response =
        await fetch(
          PROGRESS_API,
          {
            method: "GET",

            headers:
              getAuthHeaders(),

            cache:
              "no-store"
          }
        )


      const data =
        await response.json()


      console.log(
        "Teacher Song Progress - API response:",
        data
      )


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load song progress."
        )

      }


      const progressData =
        Array.isArray(
          data.progress
        )
          ? data.progress
          : []


      setProgressList(
        progressData
      )


      if (showError) {

        setError("")

      }


    } catch (error) {

      console.error(
        "Song progress loading error:",
        error
      )


      if (showError) {

        setProgressList([])

        setError(
          error.message ||
          "Unable to load student progress."
        )

      }

    }

  }


  // ==================================================
  // LOAD EVERYTHING
  // ==================================================

  async function loadData(
    showLoader = true
  ) {

    if (showLoader) {

      setLoading(true)

    }


    setError("")


    await Promise.all([
      loadSongs(
        true
      ),

      loadProgressData(
        true
      )
    ])


    if (showLoader) {

      setLoading(false)

    }

  }


  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {

    loadData(true)


    // ----------------------------------------------
    // SONG UPDATED
    // ----------------------------------------------

    function handleSongUpdate() {

      loadSongs(
        false
      )

    }


    // ----------------------------------------------
    // PROGRESS UPDATED
    // ----------------------------------------------

    function handleProgressUpdate() {

      loadProgressData(
        false
      )

    }


    window.addEventListener(
      "songsUpdated",
      handleSongUpdate
    )


    window.addEventListener(
      "progressUpdated",
      handleProgressUpdate
    )


    // ----------------------------------------------
    // AUTOMATIC REFRESH
    // ----------------------------------------------

    const refreshInterval =
      setInterval(() => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          loadSongs(
            false
          )

          loadProgressData(
            false
          )

        }

      }, 5000)


    // ----------------------------------------------
    // REFRESH WHEN TAB BECOMES ACTIVE
    // ----------------------------------------------

    function handleVisibilityChange() {

      if (
        document.visibilityState ===
        "visible"
      ) {

        loadSongs(
          false
        )

        loadProgressData(
          false
        )

      }

    }


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    )


    // ----------------------------------------------
    // CLEANUP
    // ----------------------------------------------

    return () => {

      window.removeEventListener(
        "songsUpdated",
        handleSongUpdate
      )


      window.removeEventListener(
        "progressUpdated",
        handleProgressUpdate
      )


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      )


      clearInterval(
        refreshInterval
      )

    }

  }, [])


  // ==================================================
  // GET STUDENTS FOR SONG
  // ==================================================

  function getSongStudents(
    songId
  ) {

    return progressList.filter(
      (item) => {

        const itemSongId =
          item.songId ||
          item.songID ||
          item.song_id ||
          ""


        return (
          String(
            itemSongId
          ) ===
          String(
            songId
          )
        )

      }
    )

  }


  // ==================================================
  // GET PROGRESS
  // ==================================================

  function getProgress(
    student
  ) {

    const value =
      Number(
        student.progress ||
        0
      )


    return Math.min(
      100,
      Math.max(
        0,
        value
      )
    )

  }


  // ==================================================
  // GET STATUS
  // ==================================================

  function getStatus(
    student
  ) {

    const progress =
      getProgress(
        student
      )


    if (
      progress >= 100
    ) {

      return "Completed"

    }


    if (
      progress > 0
    ) {

      return "Learning"

    }


    return "Not Started"

  }


  // ==================================================
  // GET COMPLETED COUNT
  // ==================================================

  function getCompletedCount(
    songId
  ) {

    return getSongStudents(
      songId
    ).filter(
      (student) =>
        getProgress(
          student
        ) >= 100
    ).length

  }


  // ==================================================
  // GET AVERAGE PROGRESS
  // ==================================================

  function getAverageProgress(
    songId
  ) {

    const students =
      getSongStudents(
        songId
      )


    if (
      students.length === 0
    ) {

      return 0

    }


    const total =
      students.reduce(
        (
          sum,
          student
        ) =>
          sum +
          getProgress(
            student
          ),
        0
      )


    return Math.round(
      total /
      students.length
    )

  }


  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {

    return (

      <div className="teacher-progress-page">

        <div className="teacher-progress-header">

          <div>

            <p>
              LEARNING PROGRESS
            </p>


            <h1>
              Song Progress 📊
            </h1>


            <span>
              Loading songs and student progress...
            </span>

          </div>

        </div>


        <div className="no-progress-songs">

          <div>
            🎵
          </div>


          <h2>
            Loading...
          </h2>


          <p>
            Please wait while the data is loaded.
          </p>

        </div>

      </div>

    )

  }


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div className="teacher-progress-page">


      {/* ============================================
          HEADER
      ============================================ */}

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


        <button
          type="button"
          className="secondary-button"

          onClick={() =>
            loadData(true)
          }
        >

          🔄 Refresh

        </button>

      </div>


      {/* ============================================
          ERROR
      ============================================ */}

      {error && (

        <div className="login-error">

          {error}


          <button
            type="button"

            onClick={() =>
              loadData(true)
            }

            style={{
              marginLeft:
                "12px"
            }}
          >

            🔄 Retry

          </button>

        </div>

      )}


      {/* ============================================
          NO SONGS
      ============================================ */}

      {songs.length === 0 ? (

        <div className="no-progress-songs">

          <div>
            🎵
          </div>


          <h2>
            No songs available
          </h2>


          <p>
            Add a song from the Admin or Teacher
            panel to track student progress.
          </p>

        </div>

      ) : (


        /* ==========================================
           SONG GRID
        ========================================== */

        <div className="progress-song-grid">

          {songs.map(
            (song) => {

              const songId =
                getSongId(
                  song
                )


              const students =
                getSongStudents(
                  songId
                )


              const completed =
                getCompletedCount(
                  songId
                )


              const averageProgress =
                getAverageProgress(
                  songId
                )


              return (

                <div
                  className="progress-song-card"

                  key={
                    String(
                      songId
                    )
                  }
                >


                  {/* ==================================
                      SONG INFORMATION
                  ================================== */}

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
                          "Medium"}

                      </p>

                    </div>

                  </div>


                  {/* ==================================
                      ASSIGNED STUDENT
                  ================================== */}

                  <div className="progress-song-assignment">

                    <span>
                      Assigned to
                    </span>


                    <strong>

                      {song.assignedStudentName
                        ? `👤 ${song.assignedStudentName}`
                        : "👥 All Students"}

                    </strong>

                  </div>


                  {/* ==================================
                      STATISTICS
                  ================================== */}

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


                  {/* ==================================
                      OVERALL PROGRESS
                  ================================== */}

                  <div
                    style={{
                      marginTop:
                        "18px"
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",

                        marginBottom:
                          "8px"
                      }}
                    >

                      <span
                        style={{
                          fontSize:
                            "14px",

                          color:
                            "#6b7280"
                        }}
                      >

                        Overall Progress

                      </span>


                      <strong
                        style={{
                          color:
                            "#6a35e8",

                          fontSize:
                            "18px"
                        }}
                      >

                        {averageProgress}%

                      </strong>

                    </div>


                    <div
                      style={{
                        width:
                          "100%",

                        height:
                          "9px",

                        background:
                          "#eeeaf8",

                        borderRadius:
                          "20px",

                        overflow:
                          "hidden"
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${averageProgress}%`,

                          height:
                            "100%",

                          background:
                            "#7c3aed",

                          borderRadius:
                            "20px",

                          transition:
                            "width 0.3s ease"
                        }}
                      />

                    </div>

                  </div>


                  {/* ==================================
                      VIEW STUDENTS
                  ================================== */}

                  <button
                    type="button"
                    className="view-progress-btn"

                    onClick={() =>
                      setSelectedSong(
                        song
                      )
                    }
                  >

                    👥 View Students

                  </button>

                </div>

              )

            }
          )}

        </div>

      )}


      {/* ============================================
          STUDENT PROGRESS MODAL
      ============================================ */}

      {selectedSong && (

        <div
          className="teacher-progress-overlay"

          onClick={() =>
            setSelectedSong(
              null
            )
          }
        >

          <div
            className="teacher-progress-modal"

            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* CLOSE */}

            <button
              type="button"
              className="teacher-progress-close"

              onClick={() =>
                setSelectedSong(
                  null
                )
              }
            >

              ✕

            </button>


            {/* SONG ICON */}

            <div className="progress-modal-icon">

              🎵

            </div>


            {/* TITLE */}

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


            {/* ========================================
                OVERALL PROGRESS
            ======================================== */}

            <div
              style={{
                margin:
                  "20px 0"
              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  marginBottom:
                    "8px"
                }}
              >

                <strong>
                  Overall Progress
                </strong>


                <strong
                  style={{
                    color:
                      "#6a35e8"
                  }}
                >

                  {
                    getAverageProgress(
                      getSongId(
                        selectedSong
                      )
                    )
                  }%

                </strong>

              </div>


              <div
                style={{
                  width:
                    "100%",

                  height:
                    "10px",

                  background:
                    "#eeeaf8",

                  borderRadius:
                    "20px",

                  overflow:
                    "hidden"
                }}
              >

                <div
                  style={{
                    width:
                      `${getAverageProgress(
                        getSongId(
                          selectedSong
                        )
                      )}%`,

                    height:
                      "100%",

                    background:
                      "#7c3aed",

                    borderRadius:
                      "20px"
                  }}
                />

              </div>

            </div>


            {/* ========================================
                STUDENT LIST
            ======================================== */}

            <div className="student-progress-list">

              {getSongStudents(
                getSongId(
                  selectedSong
                )
              ).length === 0 ? (

                <div className="no-student-progress">

                  <div>
                    👨‍🎓
                  </div>


                  <p>
                    No students have practiced
                    this song yet.
                  </p>

                  <small
                    style={{
                      display:
                        "block",

                      marginTop:
                        "8px",

                      color:
                        "#777"
                    }}
                  >

                    Once a student updates their
                    song progress, it will appear here.

                  </small>

                </div>

              ) : (

                getSongStudents(
                  getSongId(
                    selectedSong
                  )
                ).map(
                  (
                    student,
                    index
                  ) => {

                    const progress =
                      getProgress(
                        student
                      )


                    const status =
                      getStatus(
                        student
                      )


                    return (

                      <div
                        className="student-progress-row"

                        key={
                          student.studentId
                            ? `${student.songId}-${student.studentId}`
                            : `${student.songId}-${student.studentName}-${index}`
                        }
                      >


                        {/* STUDENT */}

                        <div className="progress-student-info">

                          <div className="progress-student-avatar">

                            👤

                          </div>


                          <div>

                            <strong>

                              {student.studentName ||
                                "Student"}

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
                            />

                          </div>

                        </div>


                        {/* STATUS */}

                        <span
                          className={
                            status ===
                            "Completed"

                              ? "progress-completed"

                              : status ===
                                "Learning"

                                ? "progress-learning"

                                : "progress-not-started"
                          }
                        >

                          {status ===
                          "Completed"

                            ? "✓ Completed"

                            : status ===
                              "Learning"

                              ? "Learning"

                              : "Not Started"}

                        </span>

                      </div>

                    )

                  }
                )

              )}

            </div>


            {/* CLOSE */}

            <button
              type="button"
              className="close-details-btn"

              onClick={() =>
                setSelectedSong(
                  null
                )
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