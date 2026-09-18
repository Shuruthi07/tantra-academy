import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const defaultSongs = [
  {
    id: 1,
    title: "Perfect",
    artist: "Ed Sheeran",
    category: "Vocal",
    difficulty: "Easy",
    progress: 80,
  },
  {
    id: 2,
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    category: "Vocal",
    difficulty: "Medium",
    progress: 60,
  },
  {
    id: 3,
    title: "Let Her Go",
    artist: "Passenger",
    category: "Guitar",
    difficulty: "Medium",
    progress: 45,
  },
  {
    id: 4,
    title: "Someone Like You",
    artist: "Adele",
    category: "Piano",
    difficulty: "Hard",
    progress: 30,
  },
]

function SongLearning() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [foundSong, setFoundSong] = useState(null)
  const [automaticLyrics, setAutomaticLyrics] = useState("")
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState("")
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")

  // =========================================
  // LOAD SONG
  // =========================================

  useEffect(() => {
    const songId = searchParams.get("id")

    let songs = []

    try {
      const savedSongs = JSON.parse(
        localStorage.getItem("tantraSongs")
      )

      if (Array.isArray(savedSongs)) {
        songs = savedSongs
      }
    } catch (error) {
      songs = []
    }

    const allSongs = [...defaultSongs, ...songs]

    let selectedSong = null

    if (songId) {
      selectedSong = allSongs.find(
        (song) => String(song.id) === String(songId)
      )
    }

    if (!selectedSong) {
      selectedSong = allSongs[0]
    }

    setFoundSong(selectedSong)

    // =========================================
    // LOAD STUDENT PROGRESS
    // =========================================

    try {
      const savedProgress = JSON.parse(
        localStorage.getItem("tantraStudentProgress")
      )

      if (Array.isArray(savedProgress)) {
        const progressItem = savedProgress.find(
          (item) =>
            String(item.songId) === String(selectedSong.id)
        )

        if (progressItem) {
          setProgress(Number(progressItem.progress) || 0)
          return
        }
      }
    } catch (error) {
      console.log("Progress loading error:", error)
    }

    setProgress(Number(selectedSong.progress) || 0)
  }, [searchParams])


  // =========================================
  // AUTOMATIC LYRICS
  // =========================================

  useEffect(() => {
    if (!foundSong) {
      return
    }

    const fetchLyrics = async () => {
      setLyricsLoading(true)
      setLyricsError("")
      setAutomaticLyrics("")

      try {
        const response = await fetch(
          `https://tantra-academy.onrender.com/api/lyrics?song=${encodeURIComponent(
            foundSong.title
          )}&artist=${encodeURIComponent(
            foundSong.artist
          )}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || "Lyrics not found"
          )
        }

        setAutomaticLyrics(
          data.lyrics || ""
        )
      } catch (error) {
        console.error(
          "Automatic lyrics error:",
          error
        )

        setLyricsError(
          "Automatic lyrics could not be loaded."
        )
      } finally {
        setLyricsLoading(false)
      }
    }

    fetchLyrics()
  }, [foundSong])


  // =========================================
  // UPDATE PROGRESS
  // =========================================

  const updateProgress = (newProgress) => {
    const safeProgress = Math.max(
      0,
      Math.min(100, Number(newProgress))
    )

    setProgress(safeProgress)

    if (!foundSong) {
      return
    }

    try {
      const existingProgress = JSON.parse(
        localStorage.getItem(
          "tantraStudentProgress"
        )
      ) || []

      const updatedProgress = [...existingProgress]

      const existingIndex =
        updatedProgress.findIndex(
          (item) =>
            String(item.songId) ===
            String(foundSong.id)
        )

      const progressData = {
        songId: foundSong.id,
        songTitle: foundSong.title,
        studentName: "Student",
        progress: safeProgress,
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        updatedProgress[existingIndex] =
          progressData
      } else {
        updatedProgress.push(
          progressData
        )
      }

      localStorage.setItem(
        "tantraStudentProgress",
        JSON.stringify(updatedProgress)
      )

      window.dispatchEvent(
        new Event("progressUpdated")
      )

      if (safeProgress === 100) {
        setMessage(
          "🎉 Song completed successfully!"
        )
      } else {
        setMessage(
          "Progress updated successfully!"
        )
      }
    } catch (error) {
      console.error(
        "Progress update error:",
        error
      )
    }
  }


  // =========================================
  // COMPLETE SONG
  // =========================================

  const handleComplete = () => {
    updateProgress(100)
  }


  // =========================================
  // AUDIO SEARCH
  // =========================================

  const openYouTube = () => {
    if (!foundSong) {
      return
    }

    const searchText = encodeURIComponent(
      `${foundSong.title} ${foundSong.artist}`
    )

    window.open(
      `https://www.youtube.com/results?search_query=${searchText}`,
      "_blank"
    )
  }


  const openSpotify = () => {
    if (!foundSong) {
      return
    }

    const searchText = encodeURIComponent(
      `${foundSong.title} ${foundSong.artist}`
    )

    window.open(
      `https://open.spotify.com/search/${searchText}`,
      "_blank"
    )
  }


  // =========================================
  // LOADING
  // =========================================

  if (!foundSong) {
    return (
      <div className="song-learning-page">
        <div className="song-learning-container">
          <div className="song-learning-card">
            <h2>Loading song...</h2>
          </div>
        </div>
      </div>
    )
  }


  // =========================================
  // STATUS
  // =========================================

  let status = "Not Started"

  if (progress === 100) {
    status = "Completed"
  } else if (progress > 0) {
    status = "Learning"
  }


  return (
    <div className="song-learning-page">

      <div className="song-learning-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="song-learning-header">

          <button
            className="back-button"
            onClick={() =>
              navigate("/my-songs")
            }
          >
            ← Back to My Songs
          </button>

          <div>
            <h1>
              🎵 {foundSong.title}
            </h1>

            <p>
              {foundSong.artist}
            </p>
          </div>

        </div>


        {/* =====================================
            SONG INFORMATION
        ====================================== */}

        <div className="song-learning-card">

          <div className="song-info-grid">

            <div>
              <span className="info-label">
                Category
              </span>

              <strong>
                {foundSong.category}
              </strong>
            </div>

            <div>
              <span className="info-label">
                Difficulty
              </span>

              <strong>
                {foundSong.difficulty}
              </strong>
            </div>

            <div>
              <span className="info-label">
                Status
              </span>

              <strong>
                {status}
              </strong>
            </div>

          </div>

        </div>


        {/* =====================================
            PROGRESS
        ====================================== */}

        <div className="song-learning-card">

          <div className="section-heading">

            <div>
              <h2>
                Learning Progress
              </h2>

              <p>
                Track your progress for this song.
              </p>
            </div>

            <strong className="progress-number">
              {progress}%
            </strong>

          </div>

          <div className="progress-bar-container">

            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="progress-controls">

            <button
              className="secondary-button"
              onClick={() =>
                updateProgress(
                  Math.max(
                    0,
                    progress - 10
                  )
                )
              }
            >
              − 10%
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                updateProgress(
                  Math.min(
                    100,
                    progress + 10
                  )
                )
              }
            >
              + 10%
            </button>

            <button
              className="primary-button"
              onClick={handleComplete}
            >
              ✓ Mark Completed
            </button>

          </div>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

        </div>


        {/* =====================================
            AUTOMATIC LYRICS
        ====================================== */}

        <div className="song-learning-card">

          <div className="section-heading">

            <div>
              <h2>
                📝 Automatic Lyrics
              </h2>

              <p>
                Lyrics are automatically searched
                for this song.
              </p>
            </div>

          </div>


          {lyricsLoading && (
            <div className="lyrics-loading">
              <div className="loading-spinner" />
              <p>
                Finding lyrics...
              </p>
            </div>
          )}


          {!lyricsLoading &&
            automaticLyrics && (
              <div className="lyrics-box">

                <div className="lyrics-source">
                  Automatic lyrics
                </div>

                <pre>
                  {automaticLyrics}
                </pre>

              </div>
            )}


          {!lyricsLoading &&
            !automaticLyrics &&
            lyricsError && (
              <div className="lyrics-error">
                <p>
                  {lyricsError}
                </p>

                <p>
                  You can use the audio search
                  buttons below to learn the song.
                </p>
              </div>
            )}

        </div>


        {/* =====================================
            MUSIC SEARCH
        ====================================== */}

        <div className="song-learning-card">

          <div className="section-heading">

            <div>
              <h2>
                🎧 Listen & Learn
              </h2>

              <p>
                Search for the song and practice
                along with the available audio.
              </p>
            </div>

          </div>

          <div className="audio-buttons">

            <button
              className="primary-button"
              onClick={openYouTube}
            >
              ▶ Search on YouTube
            </button>

            <button
              className="secondary-button"
              onClick={openSpotify}
            >
              🎧 Search on Spotify
            </button>

          </div>

          <p className="small-note">
            Audio opens in the selected music
            service. Full-song playback depends
            on the service and availability.
          </p>

        </div>


        {/* =====================================
            SONG DETAILS
        ====================================== */}

        <div className="song-learning-card">

          <h2>
            📚 About This Song
          </h2>

          <div className="song-details">

            <div>
              <span>
                Song
              </span>

              <strong>
                {foundSong.title}
              </strong>
            </div>

            <div>
              <span>
                Artist
              </span>

              <strong>
                {foundSong.artist}
              </strong>
            </div>

            <div>
              <span>
                Category
              </span>

              <strong>
                {foundSong.category}
              </strong>
            </div>

            <div>
              <span>
                Difficulty
              </span>

              <strong>
                {foundSong.difficulty}
              </strong>
            </div>

          </div>

        </div>


        {/* =====================================
            BACK BUTTON
        ====================================== */}

        <div className="song-learning-footer">

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/my-songs")
            }
          >
            ← Back to My Songs
          </button>

        </div>

      </div>

    </div>
  )
}

export default SongLearning