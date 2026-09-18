
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

  const [refresh, setRefresh] = useState(false)
  const [foundSong, setFoundSong] = useState(null)

  const [automaticLyrics, setAutomaticLyrics] = useState("")
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState("")

  useEffect(() => {
    const loadSong = () => {
      const savedSongs = JSON.parse(
        localStorage.getItem("tantraSongs") || "[]"
      )

      const allSongs = [...defaultSongs]

      savedSongs.forEach((savedSong) => {
        const existingIndex = allSongs.findIndex(
          (song) => String(song.id) === String(savedSong.id)
        )

        if (existingIndex >= 0) {
          allSongs[existingIndex] = {
            ...allSongs[existingIndex],
            ...savedSong,
          }
        } else {
          allSongs.push(savedSong)
        }
      })

      const urlSongId = searchParams.get("id")
      const savedSongId = localStorage.getItem("selectedSongId")

      const selectedSongId = urlSongId || savedSongId

      const song = allSongs.find(
        (item) => String(item.id) === String(selectedSongId)
      )

      setFoundSong(song || null)
    }

    loadSong()

    const handleStorage = () => {
      loadSong()
      setRefresh((value) => !value)
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("songsUpdated", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("songsUpdated", handleStorage)
    }
  }, [searchParams, refresh])

  // Automatically fetch lyrics using the song title + artist
  useEffect(() => {
    if (!foundSong?.title || !foundSong?.artist) {
      setAutomaticLyrics("")
      return
    }

    const fetchLyrics = async () => {
      setLyricsLoading(true)
      setLyricsError("")
      setAutomaticLyrics("")

      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/lyrics?song=${encodeURIComponent(
            foundSong.title
          )}&artist=${encodeURIComponent(foundSong.artist)}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Lyrics not found")
        }

        setAutomaticLyrics(data.lyrics || "")
      } catch (error) {
        console.error("Lyrics error:", error)
        setLyricsError("Lyrics are not available for this song.")
      } finally {
        setLyricsLoading(false)
      }
    }

    fetchLyrics()
  }, [foundSong])

  // Current student progress
  const savedProgress = JSON.parse(
    localStorage.getItem("tantraStudentProgress") || "[]"
  )

  const currentProgress = savedProgress.find(
    (item) =>
      String(item.songId) === String(foundSong?.id) &&
      item.studentName === "Student"
  )

  const progress = currentProgress
    ? currentProgress.progress
    : foundSong?.progress || 0

  // Full-song listening links
  const youtubeSearchUrl = foundSong
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${foundSong.title} ${foundSong.artist} official`
      )}`
    : ""

  const spotifySearchUrl = foundSong
    ? `https://open.spotify.com/search/${encodeURIComponent(
        `${foundSong.title} ${foundSong.artist}`
      )}`
    : ""

  const handleCompletePractice = () => {
    if (!foundSong) return

    const existingProgress = JSON.parse(
      localStorage.getItem("tantraStudentProgress") || "[]"
    )

    const updatedProgress = [...existingProgress]

    const existingIndex = updatedProgress.findIndex(
      (item) =>
        String(item.songId) === String(foundSong.id) &&
        item.studentName === "Student"
    )

    const progressData = {
      id:
        existingIndex >= 0
          ? updatedProgress[existingIndex].id
          : Date.now(),
      songId: foundSong.id,
      studentName: "Student",
      progress: 100,
      status: "Completed",
      completedAt: new Date().toLocaleDateString(),
    }

    if (existingIndex >= 0) {
      updatedProgress[existingIndex] = progressData
    } else {
      updatedProgress.push(progressData)
    }

    localStorage.setItem(
      "tantraStudentProgress",
      JSON.stringify(updatedProgress)
    )

    window.dispatchEvent(new Event("progressUpdated"))

    alert("🎉 Practice completed!")

    setRefresh((value) => !value)
  }

  if (!foundSong) {
    return (
      <div className="student-page">
        <div className="student-content">
          <button
            className="back-btn"
            onClick={() => navigate("/my-songs")}
          >
            ← Back to My Songs
          </button>

          <div className="empty-learning">
            <h2>Song not found</h2>
            <p>Please select a song from My Songs.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="student-page">
      <div className="student-content">

        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => navigate("/my-songs")}
        >
          ← Back to My Songs
        </button>

        {/* Song Header */}
        <div className="learning-header">
          <p className="learning-label">NOW LEARNING</p>

          <h1>{foundSong.title}</h1>

          <p className="song-artist">
            🎤 {foundSong.artist}
          </p>

          <div className="song-meta">
            <span>{foundSong.category}</span>
            <span>{foundSong.difficulty}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="learning-progress-card">
          <div className="progress-header">
            <span>Your Progress</span>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Audio */}
        <div className="learning-section">
          <h2>🎧 Audio</h2>

          <div className="automatic-audio-player">
            <p className="audio-player-title">
              🎧 Listen to the Full Song
            </p>

            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="audio-link"
            >
              ▶ Listen on YouTube
            </a>

            <a
              href={spotifySearchUrl}
              target="_blank"
              rel="noreferrer"
              className="audio-link"
              style={{ marginTop: "10px" }}
            >
              🎵 Open in Spotify
            </a>

            {foundSong.audioLink && (
              <a
                href={foundSong.audioLink}
                target="_blank"
                rel="noreferrer"
                className="audio-link"
                style={{ marginTop: "10px" }}
              >
                🔗 Teacher's Audio Link
              </a>
            )}
          </div>
        </div>

        {/* Lyrics */}
        <div className="learning-section">
          <h2>📝 Lyrics</h2>

          {lyricsLoading ? (
            <p className="empty-learning">
              🎵 Loading lyrics...
            </p>
          ) : lyricsError ? (
            <p className="empty-learning">
              {lyricsError}
            </p>
          ) : automaticLyrics ? (
            <div className="lyrics-box">
              {automaticLyrics}
            </div>
          ) : foundSong.lyrics ? (
            <div className="lyrics-box">
              {foundSong.lyrics}
            </div>
          ) : (
            <p className="empty-learning">
              Lyrics are not available for this song.
            </p>
          )}
        </div>

        {/* Teacher Instructions */}
        {foundSong.instructions && (
          <div className="learning-section">
            <h2>📌 Teacher Instructions</h2>

            <div className="lyrics-box">
              {foundSong.instructions}
            </div>
          </div>
        )}

        {/* Practice */}
        <div className="practice-card">
          <h2>🎵 Practice</h2>

          <p>
            Listen to the song, practice it carefully, and mark
            your practice as completed when you are done.
          </p>

          <button
            className="complete-practice-btn"
            onClick={handleCompletePractice}
            disabled={progress === 100}
          >
            {progress === 100
              ? "✓ Practice Completed"
              : "✓ Complete Practice"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default SongLearning

