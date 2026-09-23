import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


const SONGS_API =
  "http://127.0.0.1:5000/api/admin/songs"

const PROGRESS_API =
  "http://127.0.0.1:5000/api/song-progress"


function MySongs() {

  const [songs, setSongs] =
    useState([])

  const [progress, setProgress] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  // =====================================================
  // GET AUTH HEADERS
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
  // GET LOGGED-IN STUDENT
  // =====================================================

  function getLoggedInUser() {

    try {

      const storedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )


      if (!storedUser) {
        return null
      }


      return JSON.parse(
        storedUser
      )


    } catch (error) {

      console.error(
        "Logged-in user loading error:",
        error
      )

      return null

    }

  }


  // =====================================================
  // GET STUDENT ID
  // =====================================================

  function getStudentId(user) {

    return String(
      user?.id ||
      user?._id ||
      ""
    )

  }


  // =====================================================
  // GET SONG ID
  // =====================================================

  function getSongId(song) {

    return (
      song?.id ||
      song?._id ||
      ""
    )

  }


  // =====================================================
  // CHECK ALL STUDENTS
  // =====================================================

  function isAllStudentsSong(song) {

    const assigned =
      song?.assignedStudentId


    // Empty / null / undefined
    if (
      assigned === null ||
      assigned === undefined ||
      assigned === ""
    ) {

      return true

    }


    const normalized =
      String(assigned)
        .trim()
        .toLowerCase()


    // Different possible
    // representations of All Students
    const allStudentValues = [
      "all",
      "all students",
      "allstudents",
      "all_students",
      "everyone",
      "all-students"
    ]


    return allStudentValues.includes(
      normalized
    )

  }


  // =====================================================
  // LOAD PROGRESS
  // =====================================================

  async function loadProgress() {

    try {

      const response =
        await fetch(
          PROGRESS_API,
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
        response.ok &&
        data.success
      ) {

        setProgress(
          Array.isArray(
            data.progress
          )
            ? data.progress
            : []
        )

        return

      }


      console.error(
        "Progress loading failed:",
        data.message
      )


      setProgress([])


    } catch (error) {

      console.error(
        "Progress API error:",
        error
      )

      setProgress([])

    }

  }


  // =====================================================
  // LOAD SONGS
  // =====================================================

  async function loadSongs() {

    try {

      setLoading(true)
      setError("")


      const loggedInUser =
        getLoggedInUser()


      if (!loggedInUser) {

        setSongs([])

        setError(
          "Please log in to view your songs."
        )

        return

      }


      const studentId =
        getStudentId(
          loggedInUser
        )


      if (!studentId) {

        console.error(
          "Student ID is missing:",
          loggedInUser
        )

        setSongs([])

        setError(
          "Unable to identify your student account. Please log in again."
        )

        return

      }


      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )


      if (!token) {

        setSongs([])

        setError(
          "Your login session has expired. Please log in again."
        )

        return

      }


      console.log(
        "Loading songs for student:",
        studentId
      )


      // =================================================
      // GET ALL SONGS FROM MONGODB
      // =================================================

      const response =
        await fetch(
          SONGS_API,
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
        "Songs API response:",
        data
      )


      if (!response.ok) {

        if (
          response.status === 401
        ) {

          throw new Error(
            "Your login session has expired. Please log in again."
          )

        }


        if (
          response.status === 403
        ) {

          throw new Error(
            data.message ||
            "You do not have permission to view songs."
          )

        }


        throw new Error(
          data.message ||
          "Unable to load songs."
        )

      }


      if (
        data.success === false
      ) {

        throw new Error(
          data.message ||
          "Unable to load songs."
        )

      }


      const allSongs =
        Array.isArray(
          data.songs
        )
          ? data.songs
          : []


      console.log(
        "Total songs from database:",
        allSongs.length
      )


      // =================================================
      // FILTER SONGS FOR THIS STUDENT
      //
      // 1. Song assigned to this student
      // 2. Song assigned to All Students
      // =================================================

      const studentSongs =
        allSongs.filter(
          song => {

            const assignedId =
              song?.assignedStudentId


            // ALL STUDENTS
            if (
              isAllStudentsSong(
                song
              )
            ) {

              return true

            }


            // SPECIFIC STUDENT
            if (assignedId) {

              return (
                String(
                  assignedId
                ) ===
                String(
                  studentId
                )
              )

            }


            return false

          }
        )


      console.log(
        "Songs visible to student:",
        studentSongs
      )


      // =================================================
      // FORMAT SONGS
      // =================================================

      const formattedSongs =
        studentSongs.map(
          song => ({

            ...song,

            id:
              getSongId(
                song
              ),

            category:
              song.category ||
              song.course ||
              "Music",

            course:
              song.course ||
              song.category ||
              "Music",

            difficulty:
              song.difficulty ||
              "Medium"

          })
        )


      setSongs(
        formattedSongs
      )


      // If the database returned songs but
      // none matched, show a useful message
      if (
        allSongs.length > 0 &&
        formattedSongs.length === 0
      ) {

        console.warn(
          "Songs exist in MongoDB, but none are assigned to this student.",
          {
            studentId,
            allSongs
          }
        )

      }


    } catch (error) {

      console.error(
        "Song loading error:",
        error
      )


      setSongs([])

      setError(
        error.message ||
        "Unable to connect to the song database."
      )


    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadSongs()
    loadProgress()


    function handleProgressUpdate() {

      loadProgress()

    }


    function handleSongUpdate() {

      loadSongs()

    }


    window.addEventListener(
      "progressUpdated",
      handleProgressUpdate
    )


    window.addEventListener(
      "songsUpdated",
      handleSongUpdate
    )


    return () => {

      window.removeEventListener(
        "progressUpdated",
        handleProgressUpdate
      )


      window.removeEventListener(
        "songsUpdated",
        handleSongUpdate
      )

    }

  }, [])


  // =====================================================
  // GET SONG PROGRESS
  // =====================================================

  function getSongProgress(song) {

    const songId =
      getSongId(song)


    if (
      Array.isArray(progress)
    ) {

      const progressItem =
        progress.find(
          item =>
            String(
              item.songId
            ) ===
            String(
              songId
            )
        )


      if (progressItem) {

        return Number(
          progressItem.progress ||
          0
        )

      }

    }


    return 0

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="page-container">

        <div className="page-header">

          <div>

            <p className="card-label">
              LEARNING
            </p>

            <h1>
              My Songs
            </h1>

            <p>
              Loading your assigned songs...
            </p>

          </div>

        </div>


        <div className="no-songs-message">

          <div>
            🎵
          </div>

          <h2>
            Loading songs...
          </h2>

          <p>
            Please wait while your songs
            are loaded.
          </p>

        </div>

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="page-container">


      {/* HEADER */}

      <div className="page-header">

        <div>

          <p className="card-label">
            LEARNING
          </p>

          <h1>
            My Songs
          </h1>

          <p>
            Practice the songs assigned by
            your teacher or academy.
          </p>

        </div>


        <button
          className="secondary-button"
          onClick={() => {

            loadSongs()
            loadProgress()

          }}
        >
          🔄 Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="login-error">

          {error}

          <button
            type="button"
            onClick={() => {

              loadSongs()
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


      {/* SONGS */}

      <div className="songs-grid">

        {songs.length === 0 ? (

          <div className="no-songs-message">

            <div>
              🎵
            </div>

            <h2>
              No songs assigned
            </h2>

            <p>
              Your teacher or academy has not
              assigned any songs to you yet.
            </p>

            <button
              className="secondary-button"
              onClick={() => {

                loadSongs()
                loadProgress()

              }}
              style={{
                marginTop:
                  "15px"
              }}
            >
              🔄 Refresh Songs
            </button>

          </div>

        ) : (

          songs.map(
            song => {

              const songProgress =
                getSongProgress(
                  song
                )


              const songId =
                getSongId(song)


              return (

                <div
                  className="song-card"
                  key={
                    String(
                      songId
                    )
                  }
                >


                  {/* ICON */}

                  <div className="song-card-icon">
                    🎵
                  </div>


                  <div className="song-card-content">


                    {/* CATEGORY */}

                    <span className="song-category">

                      {song.category ||
                        song.course ||
                        "Music"}

                    </span>


                    {/* TITLE */}

                    <h2>
                      {song.title}
                    </h2>


                    {/* ARTIST */}

                    {song.artist && (

                      <span className="song-artist">
                        🎤 {song.artist}
                      </span>

                    )}


                    {/* DIFFICULTY */}

                    <span className="song-difficulty">

                      ⭐{" "}
                      {song.difficulty ||
                        "Medium"}

                    </span>


                    {/* PROGRESS */}

                    <div className="song-progress-container">

                      <div className="song-progress-bar">

                        <div
                          className="song-progress-fill"
                          style={{
                            width:
                              `${songProgress}%`
                          }}
                        />

                      </div>


                      <span>
                        {songProgress}%
                        {" "}
                        Complete
                      </span>

                    </div>


                    {/* STATUS */}

                    <p className="song-progress-status">

                      {songProgress === 100

                        ? "🎉 Completed"

                        : songProgress > 0

                          ? "🎧 Continue practicing"

                          : "🆕 Start learning"}

                    </p>


                    {/* LEARNING BUTTON */}

                    <Link
                      to={
                        `/song-learning?id=${encodeURIComponent(
                          songId
                        )}`
                      }
                      className="practice-song-btn"
                    >
                      🎵 Start Learning
                    </Link>


                  </div>

                </div>

              )

            }

          )

        )}

      </div>

    </div>

  )

}


export default MySongs