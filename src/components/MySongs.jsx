
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SONGS_API =
  "https://tantra-academy-1.onrender.com/api/admin/songs";

const PROGRESS_API =
  "https://tantra-academy-1.onrender.com/api/song-progress";

function MySongs() {
  const [songs, setSongs] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authentication headers
  function getAuthHeaders() {
    const token = sessionStorage.getItem("tantraAuthToken");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // Get logged-in user
  function getLoggedInUser() {
    try {
      const storedUser = sessionStorage.getItem("tantraLoggedInUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Logged-in user loading error:", error);
      return null;
    }
  }

  // Get student ID
  function getStudentId(user) {
    return String(user?.id || user?._id || "");
  }

  // Get song ID
  function getSongId(song) {
    return String(song?.id || song?._id || "");
  }

  // Check whether a song is assigned to all students
  function isAllStudentsSong(song) {
    const assigned = song?.assignedStudentId;

    if (assigned === null || assigned === undefined || assigned === "") {
      return true;
    }

    const normalized = String(assigned).trim().toLowerCase();

    return [
      "all",
      "all students",
      "allstudents",
      "all_students",
      "everyone",
      "all-students"
    ].includes(normalized);
  }

  // Load saved song progress from MongoDB
  async function loadProgress() {
    const token = sessionStorage.getItem("tantraAuthToken");

    if (!token) {
      console.error("Login token missing. Cannot load song progress.");
      return;
    }

    try {
      const response = await fetch(`${PROGRESS_API}/`, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store"
      });

      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message || "Unable to load saved progress."
        );
      }

      const savedProgress = Array.isArray(data.progress)
        ? data.progress
        : [];

      console.log("Saved song progress loaded:", savedProgress);
      setProgress(savedProgress);
    } catch (error) {
      console.error("Progress loading failed:", error);
      // Keep existing progress if a temporary request fails.
    }
  }

  // Load songs from backend
  async function loadSongs() {
    try {
      setLoading(true);
      setError("");

      const loggedInUser = getLoggedInUser();

      if (!loggedInUser) {
        setSongs([]);
        setError("Please log in to view your songs.");
        return;
      }

      const studentId = getStudentId(loggedInUser);

      if (!studentId) {
        setSongs([]);
        setError("Unable to identify your student account. Please log in again.");
        return;
      }

      const token = sessionStorage.getItem("tantraAuthToken");

      if (!token) {
        setSongs([]);
        setError("Your login session has expired. Please log in again.");
        return;
      }

      const response = await fetch(SONGS_API, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store"
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        if (response.status === 401) {
          throw new Error("Your login session has expired. Please log in again.");
        }

        if (response.status === 403) {
          throw new Error(
            data.message || "You do not have permission to view songs."
          );
        }

        throw new Error(data.message || "Unable to load songs.");
      }

      const allSongs = Array.isArray(data.songs) ? data.songs : [];

      // Show songs assigned to this student or all students.
      const studentSongs = allSongs.filter((song) => {
        if (isAllStudentsSong(song)) return true;

        const assignedId = song?.assignedStudentId;

        return assignedId &&
          String(assignedId) === String(studentId);
      });

      const formattedSongs = studentSongs.map((song) => ({
        ...song,
        id: getSongId(song),
        category: song.category || song.course || "Music",
        course: song.course || song.category || "Music",
        difficulty: song.difficulty || "Medium"
      }));

      setSongs(formattedSongs);

      if (allSongs.length > 0 && formattedSongs.length === 0) {
        console.warn(
          "Songs exist, but none are assigned to this student.",
          { studentId, allSongs }
        );
      }
    } catch (error) {
      console.error("Song loading error:", error);
      setSongs([]);
      setError(error.message || "Unable to connect to the song database.");
    } finally {
      setLoading(false);
    }
  }

  // Initial load and refresh progress when it changes
  useEffect(() => {
    loadSongs();
    loadProgress();

    function handleProgressUpdate() {
      loadProgress();
    }

    function handleSongUpdate() {
      loadSongs();
    }

    window.addEventListener("progressUpdated", handleProgressUpdate);
    window.addEventListener("songsUpdated", handleSongUpdate);

    return () => {
      window.removeEventListener("progressUpdated", handleProgressUpdate);
      window.removeEventListener("songsUpdated", handleSongUpdate);
    };
  }, []);

  // Get progress for a particular song
  function getSongProgress(song) {
    const songId = getSongId(song);

    const progressItem = progress.find(
      (item) => String(item.songId) === String(songId)
    );

    return progressItem ? Number(progressItem.progress ?? 0) : 0;
  }

  // Refresh button
  async function handleRefresh() {
    await Promise.all([loadSongs(), loadProgress()]);
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="card-label">LEARNING</p>
            <h1>My Songs</h1>
            <p>Loading your assigned songs...</p>
          </div>
        </div>

        <div className="no-songs-message">
          <div>🎵</div>
          <h2>Loading songs...</h2>
          <p>Please wait while your songs are loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="card-label">LEARNING</p>
          <h1>My Songs</h1>
          <p>Practice the songs assigned by your teacher or academy.</p>
        </div>

        <button className="secondary-button" onClick={handleRefresh}>
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="login-error">
          {error}
          <button
            type="button"
            onClick={handleRefresh}
            style={{ marginLeft: "12px" }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Songs */}
      <div className="songs-grid">
        {songs.length === 0 ? (
          <div className="no-songs-message">
            <div>🎵</div>
            <h2>No songs assigned</h2>
            <p>Your teacher or academy has not assigned any songs to you yet.</p>

            <button
              className="secondary-button"
              onClick={handleRefresh}
              style={{ marginTop: "15px" }}
            >
              🔄 Refresh Songs
            </button>
          </div>
        ) : (
          songs.map((song) => {
            const songProgress = getSongProgress(song);
            const songId = getSongId(song);

            return (
              <div className="song-card" key={songId}>
                <div className="song-card-icon">🎵</div>

                <div className="song-card-content">
                  <span className="song-category">
                    {song.category || song.course || "Music"}
                  </span>

                  <h2>{song.title}</h2>

                  {song.artist && (
                    <span className="song-artist">
                      🎤 {song.artist}
                    </span>
                  )}

                  <span className="song-difficulty">
                    ⭐ {song.difficulty || "Medium"}
                  </span>

                  {/* Progress bar */}
                  <div className="song-progress-container">
                    <div className="song-progress-bar">
                      <div
                        className="song-progress-fill"
                        style={{ width: `${songProgress}%` }}
                      />
                    </div>

                    <span>{songProgress}% Complete</span>
                  </div>

                  {/* Progress status */}
                  <p className="song-progress-status">
                    {songProgress === 100
                      ? "🎉 Completed"
                      : songProgress > 0
                      ? "🎧 Continue practicing"
                      : "🆕 Start learning"}
                  </p>

                  <Link
                    to={`/song-learning?id=${encodeURIComponent(songId)}`}
                    className="practice-song-btn"
                  >
                    🎵 Start Learning
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MySongs;