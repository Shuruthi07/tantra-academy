import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function TeacherSongs() {

  const [songs, setSongs] = useState(
    JSON.parse(localStorage.getItem("tantraSongs")) || []
  )

  const [studentProgress, setStudentProgress] = useState(
    JSON.parse(localStorage.getItem("tantraStudentProgress")) || []
  )

  const [selectedSong, setSelectedSong] = useState(null)


  // =========================================
  // LOAD DATA
  // =========================================

  function loadSongs() {

    const savedSongs =
      JSON.parse(localStorage.getItem("tantraSongs")) || []

    const savedProgress =
      JSON.parse(
        localStorage.getItem("tantraStudentProgress")
      ) || []

    setSongs(savedSongs)
    setStudentProgress(savedProgress)
  }


  // =========================================
  // LIVE UPDATE
  // =========================================

  useEffect(() => {

    loadSongs()

    window.addEventListener("storage", loadSongs)
    window.addEventListener("songsUpdated", loadSongs)
    window.addEventListener("progressUpdated", loadSongs)

    return () => {

      window.removeEventListener("storage", loadSongs)
      window.removeEventListener("songsUpdated", loadSongs)
      window.removeEventListener("progressUpdated", loadSongs)

    }

  }, [])


  // =========================================
  // GET SONG PROGRESS
  // =========================================

  function getSongProgress(songId) {

    const progressList =
      studentProgress.filter(
        (item) =>
          String(item.songId) === String(songId)
      )

    if (progressList.length === 0) {
      return 0
    }

    const totalProgress =
      progressList.reduce(
        (sum, item) =>
          sum + Number(item.progress || 0),
        0
      )

    return Math.round(
      totalProgress / progressList.length
    )
  }


  // =========================================
  // GET SONG STATUS
  // =========================================

  function getSongStatus(song) {

    const progress =
      getSongProgress(song.id)

    if (progress >= 100) {
      return "Completed"
    }

    return "New"
  }


  // =========================================
  // DELETE SONG
  // =========================================

  function deleteSong(id) {

    const song =
      songs.find(
        (item) => item.id === id
      )

    const confirmed =
      window.confirm(
        `Delete "${song?.title || "this song"}"?`
      )

    if (!confirmed) {
      return
    }


    const updatedSongs =
      songs.filter(
        (item) => item.id !== id
      )


    setSongs(updatedSongs)


    localStorage.setItem(
      "tantraSongs",
      JSON.stringify(updatedSongs)
    )


    window.dispatchEvent(
      new Event("songsUpdated")
    )

  }


  return (

    <div className="teacher-songs-page">

      {/* =================================
          HEADER
      ================================= */}

      <div className="teacher-songs-header">

        <div>

          <p>
            SONG MANAGEMENT
          </p>

          <h1>
            Songs 🎵
          </h1>

          <span>
            Manage songs and learning materials for your students.
          </span>

        </div>

      </div>


      {/* =================================
          SUMMARY
      ================================= */}

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
            New Songs
          </span>

          <h2>
            {
              songs.filter(
                (song) =>
                  getSongStatus(song) === "New"
              ).length
            }
          </h2>

          <p>
            Recently published
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
                  getSongStatus(song) === "Completed"
              ).length
            }
          </h2>

          <p>
            Fully practiced songs
          </p>

        </div>

      </div>


      {/* =================================
          SONGS CARD
      ================================= */}

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


        {/* =================================
            EMPTY STATE
        ================================= */}

        {songs.length === 0 ? (

          <div className="no-teacher-songs">

            <div>
              🎵
            </div>

            <h2>
              No songs published yet
            </h2>

            <p>
              Teach your first song from the Teacher Dashboard.
            </p>


            <Link
              to="/teacher-dashboard"
              className="teach-song-again-btn"
            >
              + Teach Your First Song
            </Link>

          </div>

        ) : (

          /* =================================
             SONG LIST
          ================================= */

          <div className="teacher-songs-list">

            {songs.map((song) => {

              const progress =
                getSongProgress(song.id)

              const status =
                getSongStatus(song)

              return (

                <div
                  className="teacher-song-row"
                  key={song.id}
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
                          "Music"}{" "}
                        ·{" "}
                        {song.difficulty ||
                          "Easy"}
                      </span>

                    </div>

                  </div>


                  {/* PROGRESS */}

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
                          width: `${progress}%`
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div>

                    <span
                      className={
                        status === "Completed"
                          ? "teacher-song-completed"
                          : "teacher-song-new"
                      }
                    >

                      {status === "Completed"
                        ? "✓ Completed"
                        : "🆕 New"}

                    </span>

                  </div>


                  {/* ACTIONS */}

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
                        deleteSong(song.id)
                      }
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              )

            })}

          </div>

        )}

      </div>


      {/* =================================
          VIEW SONG MODAL
      ================================= */}

      {selectedSong && (

        <div
          className="teacher-song-modal-overlay"
          onClick={() =>
            setSelectedSong(null)
          }
        >

          <div
            className="teacher-song-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="teacher-song-modal-close"
              onClick={() =>
                setSelectedSong(null)
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
                "Easy"}

            </span>


            {/* LEARNING MATERIAL */}

            <div className="teacher-song-modal-section">

              <strong>
                📖 Learning Material
              </strong>

              <p>
                {selectedSong.lyrics ||
                  "No learning material added."}
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
                  href={selectedSong.audioLink}
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


            {/* STATUS */}

            <div className="teacher-song-modal-progress">

              <span>
                Status
              </span>

              <strong>
                {selectedSong.status === "Completed"
                  ? "✓ Completed"
                  : "🆕 New"}
              </strong>

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


export default TeacherSongs