import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const defaultSongs = [
  {
    id: 1,
    title: "Perfect",
    artist: "Ed Sheeran",
    category: "Vocal",
    difficulty: "Easy",
    progress: 80
  },
  {
    id: 2,
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    category: "Vocal",
    difficulty: "Medium",
    progress: 60
  },
  {
    id: 3,
    title: "Let Her Go",
    artist: "Passenger",
    category: "Guitar",
    difficulty: "Medium",
    progress: 45
  },
  {
    id: 4,
    title: "Someone Like You",
    artist: "Adele",
    category: "Piano",
    difficulty: "Hard",
    progress: 30
  }
]

function MySongs() {

  const [songs, setSongs] = useState([])
  const [progress, setProgress] = useState([])


  // =========================================
  // LOAD SONGS
  // =========================================

  function loadSongs() {

    let savedSongs = []
    let savedProgress = []

    try {

      const storedSongs =
        localStorage.getItem("tantraSongs")

      if (storedSongs) {

        const parsedSongs =
          JSON.parse(storedSongs)

        if (Array.isArray(parsedSongs)) {
          savedSongs = parsedSongs
        }

      }

    } catch (error) {

      console.error(
        "Error loading songs:",
        error
      )

    }


    // =========================================
    // LOAD PROGRESS
    // =========================================

    try {

      const storedProgress =
        localStorage.getItem(
          "tantraStudentProgress"
        )

      if (storedProgress) {

        const parsedProgress =
          JSON.parse(storedProgress)

        if (Array.isArray(parsedProgress)) {
          savedProgress = parsedProgress
        }

      }

    } catch (error) {

      console.error(
        "Error loading progress:",
        error
      )

    }


    // =========================================
    // COMBINE DEFAULT + TEACHER SONGS
    // =========================================

    const songMap = new Map()

    // Add default songs first
    defaultSongs.forEach((song) => {

      songMap.set(
        String(song.id),
        song
      )

    })


    // Teacher songs override defaults
    savedSongs.forEach((song) => {

      if (!song || !song.id) return

      songMap.set(
        String(song.id),
        {
          ...song
        }
      )

    })


    const combinedSongs =
      Array.from(songMap.values())


    setSongs(combinedSongs)
    setProgress(savedProgress)

  }


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    loadSongs()


    function handleSongUpdate() {
      loadSongs()
    }


    function handleProgressUpdate() {
      loadSongs()
    }


    window.addEventListener(
      "songsUpdated",
      handleSongUpdate
    )

    window.addEventListener(
      "progressUpdated",
      handleProgressUpdate
    )

    window.addEventListener(
      "storage",
      handleSongUpdate
    )


    return () => {

      window.removeEventListener(
        "songsUpdated",
        handleSongUpdate
      )

      window.removeEventListener(
        "progressUpdated",
        handleProgressUpdate
      )

      window.removeEventListener(
        "storage",
        handleSongUpdate
      )

    }

  }, [])


  // =========================================
  // GET PROGRESS
  // =========================================

  function getSongProgress(song) {

    if (Array.isArray(progress)) {

      const studentProgress =
        progress.find(
          (item) =>
            String(item.songId) ===
              String(song.id) &&
            item.studentName === "Student"
        )


      if (studentProgress) {

        return Number(
          studentProgress.progress || 0
        )

      }

    }


    return Number(
      song.progress || 0
    )

  }


  return (

    <div className="page-container">

      {/* =====================================
          PAGE HEADER
          ===================================== */}

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
            your teacher.
          </p>

        </div>

      </div>


      {/* =====================================
          SONG GRID
          ===================================== */}

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
              Your teacher has not assigned
              any songs yet.
            </p>

          </div>

        ) : (

          songs.map((song) => {

            const songProgress =
              getSongProgress(song)


            return (

              <div
                className="song-card"
                key={song.id}
              >

                {/* SONG ICON */}

                <div className="song-card-icon">
                  🎵
                </div>


                {/* SONG CONTENT */}

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
                      {song.artist}
                    </span>

                  )}


                  {/* DIFFICULTY */}

                  {song.difficulty && (

                    <span className="song-difficulty">
                      {song.difficulty}
                    </span>

                  )}


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
                      {songProgress}% Complete
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


                  {/* START LEARNING */}

                  <Link
                    to={`/song-learning?id=${song.id}`}
                    className="practice-song-btn"
                  >
                    🎵 Start Learning
                  </Link>

                </div>

              </div>

            )

          })

        )}

      </div>

    </div>

  )

}

export default MySongs