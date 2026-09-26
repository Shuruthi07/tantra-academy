import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


// ==================================================
// API
// ==================================================

const SONGS_API =
  "https://tantra-academy-1.onrender.com/api/admin/songs"


// IMPORTANT:
// Keep the trailing slash.
// Flask route uses /api/song-progress/
const PROGRESS_API =
  "https://tantra-academy-1.onrender.com/api/song-progress/"


// ==================================================
// COMPONENT
// ==================================================

function TeacherSongs() {

  const [songs, setSongs] =
    useState([])


  const [studentProgress, setStudentProgress] =
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
  // LOAD SONGS FROM MONGODB
  // ==================================================

  async function loadSongs(
    showError = true
  ) {

    try {

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
  // LOAD STUDENT PROGRESS FROM MONGODB
  // ==================================================

  async function loadProgress(
    showError = true
  ) {

    try {

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )


      if (!token) {

        throw new Error(
          "Authentication token is missing."
        )

      }


      // IMPORTANT:
      // PROGRESS_API already has /
      // DO NOT add another /

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


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load student progress."
        )

      }


      console.log(
        "Teacher progress received:",
        data
      )


      setStudentProgress(

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


      if (showError) {

        setStudentProgress([])

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


    if (showErrorReset()) {
      setError("")
    }


    await Promise.all([
      loadSongs(showLoader),
      loadProgress(showLoader)
    ])


    if (showLoader) {

      setLoading(false)

    }

  }


  // ==================================================
  // ERROR RESET HELPER
  // ==================================================

  function showErrorReset() {

    setError("")

    return true

  }


  // ==================================================
  // INITIAL LOAD + AUTOMATIC REFRESH
  // ==================================================

  useEffect(() => {

    loadData(true)


    // ----------------------------------------------
    // SONG UPDATED IN SAME TAB
    // ----------------------------------------------

    function handleSongsUpdated() {

      loadSongs(false)

    }


    // ----------------------------------------------
    // PROGRESS UPDATED IN SAME TAB
    // ----------------------------------------------

    function handleProgressUpdated() {

      loadProgress(false)

    }


    window.addEventListener(
      "songsUpdated",
      handleSongsUpdated
    )


    window.addEventListener(
      "progressUpdated",
      handleProgressUpdated
    )


    // ----------------------------------------------
    // REFRESH EVERY 5 SECONDS
    // ----------------------------------------------

    const syncInterval =
      setInterval(() => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          loadSongs(false)

          loadProgress(false)

        }

      }, 5000)


    // ----------------------------------------------
    // REFRESH WHEN RETURNING TO TAB
    // ----------------------------------------------

    function handleVisibilityChange() {

      if (
        document.visibilityState ===
        "visible"
      ) {

        loadSongs(false)

        loadProgress(false)

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
        handleSongsUpdated
      )


      window.removeEventListener(
        "progressUpdated",
        handleProgressUpdated
      )


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      )


      clearInterval(
        syncInterval
      )

    }

  }, [])


  // ==================================================
  // GET SONG ID
  // ==================================================

  function getSongId(
    song
  ) {

    return (
      song?.id ||
      song?._id ||
      ""
    )

  }


  // ==================================================
  // GET SONG PROGRESS
  // ==================================================

  function getSongProgress(
    songId
  ) {

    const progressList =
      studentProgress.filter(
        (item) =>
          String(
            item.songId ||
            item.songID ||
            item.song_id ||
            ""
          ) ===
          String(
            songId
          )
      )


    if (
      progressList.length === 0
    ) {

      return 0

    }


    const totalProgress =
      progressList.reduce(
        (
          sum,
          item
        ) => {

          return (
            sum +
            Number(
              item.progress ||
              0
            )
          )

        },
        0
      )


    return Math.round(
      totalProgress /
      progressList.length
    )

  }


  // ==================================================
  // GET SONG STATUS
  // ==================================================

  function getSongStatus(
    song
  ) {

    const progress =
      getSongProgress(
        getSongId(
          song
        )
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


    return "New"

  }


  // ==================================================
  // GET ASSIGNED STUDENT
  // ==================================================

  function getAssignedStudent(
    song
  ) {

    if (
      song.assignedStudentName
    ) {

      return (
        song.assignedStudentName
      )

    }


    if (
      song.assignedStudentId
    ) {

      return "Assigned Student"

    }


    return "All Students"

  }


  // ==================================================
  // GET STUDENT COUNT
  // ==================================================

  function getStudentCount(
    songId
  ) {

    return studentProgress.filter(
      (item) =>
        String(
          item.songId ||
          item.songID ||
          item.song_id ||
          ""
        ) ===
        String(
          songId
        )
    ).length

  }


  // ==================================================
  // DELETE SONG
  // ==================================================

  async function deleteSong(
    id
  ) {

    const song =
      songs.find(
        (item) =>
          String(
            getSongId(
              item
            )
          ) ===
          String(
            id
          )
      )


    const confirmed =
      window.confirm(
        `Delete "${song?.title || "this song"}"?`
      )


    if (!confirmed) {

      return

    }


    try {

      const response =
        await fetch(
          `${SONGS_API}/${id}`,
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
          "Unable to delete song."
        )

        return

      }


      alert(
        "Song deleted successfully."
      )


      await loadSongs()


      window.dispatchEvent(
        new Event(
          "songsUpdated"
        )
      )


    } catch (error) {

      console.error(
        "Song delete error:",
        error
      )


      alert(
        "Unable to connect to the backend."
      )

    }

  }


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="teacher-songs-page">

        <div className="teacher-songs-header">

          <div>

            <p>
              SONG MANAGEMENT
            </p>

            <h1>
              Songs 🎵
            </h1>

            <span>
              Loading songs from the database...
            </span>

          </div>

        </div>


        <div className="no-teacher-songs">

          <div>
            🎵
          </div>

          <h2>
            Loading songs...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>

    )

  }


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div className="teacher-songs-page">


      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="teacher-songs-header">

        <div>

          <p>
            SONG MANAGEMENT
          </p>


          <h1>
            Songs 🎵
          </h1>


          <span>
            Manage songs and learning materials
            for your students.
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


      {/* ==========================================
          ERROR
      ========================================== */}

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


      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="teacher-song-summary">

        <div className="teacher-song-summary-card">

          <span>
            Published Songs
          </span>

          <h2>
            {songs.length}
          </h2>

          <p>
            Songs available to students
          </p>

        </div>


        <div className="teacher-song-summary-card">

          <span>
            Learning Songs
          </span>

          <h2>

            {
              songs.filter(
                (song) =>
                  getSongStatus(
                    song
                  ) ===
                  "Learning"
              ).length
            }

          </h2>

          <p>
            Students are practicing
          </p>

        </div>


        <div className="teacher-song-summary-card">

          <span>
            Completed
          </span>

          <h2>

            {
              songs.filter(
                (song) =>
                  getSongStatus(
                    song
                  ) ===
                  "Completed"
              ).length
            }

          </h2>

          <p>
            Fully practiced songs
          </p>

        </div>

      </div>


      {/* ==========================================
          SONGS CARD
      ========================================== */}

      <div className="teacher-songs-card">

        <div className="teacher-songs-card-header">

          <div>

            <p>
              YOUR SONGS
            </p>

            <h2>
              Published Lessons
            </h2>

          </div>


          <Link
            to="/teacher-dashboard"
            className="teach-song-again-btn"
          >

            + Teach New Song

          </Link>

        </div>


        {/* ========================================
            NO SONGS
        ======================================== */}

        {songs.length === 0 ? (

          <div className="no-teacher-songs">

            <div>
              🎵
            </div>


            <h2>
              No songs published yet
            </h2>


            <p>
              Add songs from the Teacher or Admin
              panel.
            </p>


            <Link
              to="/teacher-dashboard"
              className="teach-song-again-btn"
            >

              + Teach Your First Song

            </Link>

          </div>

        ) : (

          /* ========================================
             SONG LIST
          ======================================== */

          <div className="teacher-songs-list">

            {songs.map(
              (song) => {

                const songId =
                  getSongId(
                    song
                  )


                const progress =
                  getSongProgress(
                    songId
                  )


                const status =
                  getSongStatus(
                    song
                  )


                const studentCount =
                  getStudentCount(
                    songId
                  )


                return (

                  <div
                    className="teacher-song-row"
                    key={
                      String(
                        songId
                      )
                    }
                  >

                    {/* SONG */}

                    <div className="teacher-song-info">

                      <div className="teacher-song-icon">
                        🎵
                      </div>


                      <div>

                        <strong>
                          {song.title}
                        </strong>


                        <span>

                          {song.artist ||
                            song.course ||
                            "Music"}

                          {" · "}

                          {song.difficulty ||
                            "Medium"}

                        </span>


                        <small>

                          👤{" "}

                          {getAssignedStudent(
                            song
                          )}

                        </small>

                      </div>

                    </div>


                    {/* =================================
                        PROGRESS
                    ================================= */}

                    <div className="teacher-song-progress">

                      <span>
                        Student Progress
                      </span>


                      <strong>
                        {progress}%
                      </strong>


                      <div className="teacher-song-progress-bar">

                        <div
                          style={{
                            width:
                              `${Math.min(
                                Math.max(
                                  progress,
                                  0
                                ),
                                100
                              )}%`
                          }}
                        />

                      </div>

                    </div>


                    {/* =================================
                        STUDENTS
                    ================================= */}

                    <div>

                      <span>
                        Students
                      </span>


                      <strong>
                        {studentCount}
                      </strong>

                    </div>


                    {/* =================================
                        STATUS
                    ================================= */}

                    <div>

                      <span
                        className={
                          status ===
                          "Completed"
                            ? "teacher-song-completed"
                            : status ===
                              "Learning"
                              ? "teacher-song-learning"
                              : "teacher-song-new"
                        }
                      >

                        {status ===
                        "Completed"

                          ? "✓ Completed"

                          : status ===
                            "Learning"

                            ? "🎵 Learning"

                            : "🆕 New"}

                      </span>

                    </div>


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div className="teacher-song-actions">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSong({
                            ...song,
                            progress,
                            status
                          })
                        }
                      >

                        👁️ View

                      </button>


                      <button
                        type="button"
                        className="teacher-delete-song"

                        onClick={() =>
                          deleteSong(
                            songId
                          )
                        }
                      >

                        🗑️

                      </button>

                    </div>

                  </div>

                )

              }
            )}

          </div>

        )}

      </div>


      {/* ==========================================
          VIEW SONG MODAL
      ========================================== */}

      {selectedSong && (

        <div
          className="teacher-song-modal-overlay"

          onClick={() =>
            setSelectedSong(
              null
            )
          }
        >

          <div
            className="teacher-song-modal"

            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="teacher-song-modal-close"

              onClick={() =>
                setSelectedSong(
                  null
                )
              }
            >

              ✕

            </button>


            {/* ICON */}

            <div className="teacher-song-modal-icon">

              🎵

            </div>


            <p>
              SONG LESSON
            </p>


            <h2>
              {selectedSong.title}
            </h2>


            <span className="teacher-song-modal-course">

              {selectedSong.artist ||
                selectedSong.course ||
                "Music"}

              {" · "}

              {selectedSong.difficulty ||
                "Medium"}

            </span>


            {/* ASSIGNED STUDENT */}

            <div className="teacher-song-modal-section">

              <strong>
                👤 Assigned Student
              </strong>


              <p>
                {getAssignedStudent(
                  selectedSong
                )}
              </p>

            </div>


            {/* LEARNING MATERIAL */}

            <div className="teacher-song-modal-section">

              <strong>
                📖 Learning Material
              </strong>


              <p>
                {selectedSong.lyrics ||
                  "Automatic lyrics will be searched for the student when learning the song."}
              </p>

            </div>


            {/* INSTRUCTIONS */}

            <div className="teacher-song-modal-section">

              <strong>
                👨‍🏫 Teaching Instructions
              </strong>


              <p>
                {selectedSong.instructions ||
                  "No instructions added."}
              </p>

            </div>


            {/* AUDIO */}

            {selectedSong.audioLink && (

              <div className="teacher-song-modal-section">

                <strong>
                  🎧 Audio
                </strong>


                <a
                  href={
                    selectedSong.audioLink
                  }
                  target="_blank"
                  rel="noreferrer"
                >

                  ▶ Open Audio

                </a>

              </div>

            )}


            {/* PROGRESS */}

            <div className="teacher-song-modal-progress">

              <span>
                Student Progress
              </span>


              <strong>
                {selectedSong.progress || 0}%
              </strong>

            </div>


            {/* PROGRESS BAR */}

            <div className="teacher-song-progress-bar">

              <div
                style={{
                  width:
                    `${Math.min(
                      Math.max(
                        Number(
                          selectedSong.progress ||
                          0
                        ),
                        0
                      ),
                      100
                    )}%`
                }}
              />

            </div>


            {/* STATUS */}

            <div className="teacher-song-modal-progress">

              <span>
                Status
              </span>


              <strong>

                {selectedSong.status ===
                "Completed"

                  ? "✓ Completed"

                  : selectedSong.status ===
                    "Learning"

                    ? "🎵 Learning"

                    : "🆕 New"}

              </strong>

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


export default TeacherSongs