import { useEffect, useMemo, useState } from "react"

const SONGS_API =
  "http://127.0.0.1:5000/api/admin/songs"

const STUDENTS_API =
  "http://127.0.0.1:5000/api/admin/students"


function AdminSongs() {
  const [songs, setSongs] = useState([])
  const [students, setStudents] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [studentLoading, setStudentLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [showForm, setShowForm] =
    useState(false)

  const [editingSong, setEditingSong] =
    useState(null)

  const [viewSong, setViewSong] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState("")


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
  // GET STUDENT ID
  // =====================================================

  function getStudentId(student) {
    return (
      student?.id ||
      student?._id ||
      ""
    )
  }


  // =====================================================
  // JWT HEADERS
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
              "Bearer " + token
          }
        : {})
    }
  }


  // =====================================================
  // LOAD SONGS
  // =====================================================

  async function loadSongs() {
    try {
      setLoading(true)
      setError("")

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {
        setError(
          "Your admin session has expired. Please login again."
        )
        return
      }

      const response =
        await fetch(
          `${SONGS_API}?_=${Date.now()}`,
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
        "Admin songs:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "You are not authorized to manage songs."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load songs."
        )
      }

      setSongs(
        Array.isArray(data.songs)
          ? data.songs
          : []
      )
    } catch (error) {
      console.error(
        "Song loading error:",
        error
      )

      setError(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  async function loadStudents() {
    try {
      setStudentLoading(true)

      const token =
        sessionStorage.getItem(
          "tantraAuthToken"
        )

      if (!token) {
        setStudents([])
        return
      }

      const response =
        await fetch(
          `${STUDENTS_API}?_=${Date.now()}`,
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
        "Admin students:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setStudents([])
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load students."
        )
      }

      setStudents(
        Array.isArray(
          data.students
        )
          ? data.students
          : []
      )
    } catch (error) {
      console.error(
        "Student loading error:",
        error
      )

      setStudents([])
    } finally {
      setStudentLoading(false)
    }
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadSongs()
    loadStudents()
  }, [])


  // =====================================================
  // REFRESH WHEN SONGS CHANGE
  // =====================================================

  useEffect(() => {
    function handleSongsUpdated() {
      loadSongs()
    }

    window.addEventListener(
      "songsUpdated",
      handleSongsUpdated
    )

    return () => {
      window.removeEventListener(
        "songsUpdated",
        handleSongsUpdated
      )
    }
  }, [])


  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  function handleChange(event) {
    const {
      name,
      value
    } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }


  // =====================================================
  // FORM STATE
  // =====================================================

  const [form, setForm] = useState({
    title: "",
    artist: "",
    course: "Vocal Training",
    assignedStudentId: "",
    instructions: ""
  })


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  function openAddForm() {
    setEditingSong(null)

    setForm({
      title: "",
      artist: "",
      course: "Vocal Training",
      assignedStudentId: "",
      instructions: ""
    })

    setShowForm(true)
  }


  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  function openEditForm(song) {
    setEditingSong(song)

    setForm({
      title:
        song.title || "",

      artist:
        song.artist || "",

      course:
        song.course ||
        "Vocal Training",

      assignedStudentId:
        song.assignedStudentId ||
        "",

      instructions:
        song.instructions ||
        ""
    })

    setShowForm(true)
  }


  // =====================================================
  // CLOSE FORM
  // =====================================================

  function closeForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingSong(null)
  }


  // =====================================================
  // SAVE SONG
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      alert(
        "Please enter the song title."
      )
      return
    }

    if (!form.artist.trim()) {
      alert(
        "Please enter the artist name."
      )
      return
    }

    const songData = {
      title:
        form.title.trim(),

      artist:
        form.artist.trim(),

      course:
        form.course,

      assignedStudentId:
        form.assignedStudentId ||
        "",

      instructions:
        form.instructions.trim()
    }

    try {
      setSaving(true)

      let response

      // =================================================
      // UPDATE
      // =================================================

      if (editingSong) {
        const songId =
          getSongId(editingSong)

        if (!songId) {
          alert(
            "Song ID is missing."
          )
          return
        }

        response =
          await fetch(
            `${SONGS_API}/${songId}`,
            {
              method: "PUT",
              headers:
                getAuthHeaders(),
              body:
                JSON.stringify(
                  songData
                )
            }
          )
      }

      // =================================================
      // ADD
      // =================================================

      else {
        response =
          await fetch(
            SONGS_API,
            {
              method: "POST",
              headers:
                getAuthHeaders(),
              body:
                JSON.stringify(
                  songData
                )
            }
          )
      }

      const data =
        await response.json()

      console.log(
        "Save song:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "You are not authorized to manage songs."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save song."
        )
      }

      alert(
        editingSong
          ? "Song updated successfully! 🎵"
          : "Song added successfully! 🎵"
      )

      closeForm()

      await loadSongs()

      window.dispatchEvent(
        new Event("songsUpdated")
      )
    } catch (error) {
      console.error(
        "Song save error:",
        error
      )

      alert(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setSaving(false)
    }
  }


  // =====================================================
  // DELETE SONG
  // =====================================================

  async function deleteSong(song) {
    const songId =
      getSongId(song)

    if (!songId) {
      alert(
        "Song ID is missing."
      )
      return
    }

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${song.title}"?\n\nThis action cannot be undone.`
      )

    if (!confirmDelete) {
      return
    }

    try {
      setDeletingId(
        String(songId)
      )

      const response =
        await fetch(
          `${SONGS_API}/${songId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders()
          }
        )

      const data =
        await response.json()

      console.log(
        "Delete song:",
        response.status,
        data
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "You are not authorized to delete songs."
        )
        return
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete song."
        )
      }

      setSongs(
        currentSongs =>
          currentSongs.filter(
            currentSong =>
              String(
                getSongId(
                  currentSong
                )
              ) !==
              String(songId)
          )
      )

      alert(
        "Song deleted successfully. ✅"
      )

      window.dispatchEvent(
        new Event("songsUpdated")
      )
    } catch (error) {
      console.error(
        "Song delete error:",
        error
      )

      alert(
        error.message ||
          "Unable to connect to the backend."
      )
    } finally {
      setDeletingId("")
    }
  }


  // =====================================================
  // VIEW SONG
  // =====================================================

  function openView(song) {
    setViewSong(song)
  }

  function closeView() {
    setViewSong(null)
  }


  // =====================================================
  // DIFFICULTY CLASS
  // =====================================================

  function getDifficultyClass(
    difficulty
  ) {
    if (!difficulty) {
      return "medium"
    }

    return String(difficulty)
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      )
  }


  // =====================================================
  // FIND STUDENT NAME
  // =====================================================

  function getStudentName(
    studentId
  ) {
    if (!studentId) {
      return "All Students"
    }

    const student =
      students.find(
        item =>
          String(
            getStudentId(item)
          ) ===
          String(studentId)
      )

    return student
      ? student.name
      : "Student"
  }


  // =====================================================
  // SEARCH SONGS
  // =====================================================

  const filteredSongs =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase()

      if (!searchText) {
        return songs
      }

      return songs.filter(
        song => {
          const title =
            String(
              song.title || ""
            ).toLowerCase()

          const artist =
            String(
              song.artist || ""
            ).toLowerCase()

          const course =
            String(
              song.course || ""
            ).toLowerCase()

          const studentName =
            String(
              song.assignedStudentName ||
              getStudentName(
                song.assignedStudentId
              ) ||
              ""
            ).toLowerCase()

          return (
            title.includes(
              searchText
            ) ||
            artist.includes(
              searchText
            ) ||
            course.includes(
              searchText
            ) ||
            studentName.includes(
              searchText
            )
          )
        }
      )
    }, [songs, search, students])


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-songs-page">

      {/* HEADER */}

      <div className="admin-songs-header">

        <div>

          <p className="admin-label">
            ADMIN PANEL
          </p>

          <h1>
            Manage Songs 🎵
          </h1>

          <span>
            Add songs and assign them
            to students.
          </span>

        </div>

        <div className="admin-songs-header-actions">

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => {
              loadSongs()
              loadStudents()
            }}
            disabled={
              loading ||
              studentLoading
            }
          >
            {loading ||
            studentLoading
              ? "⏳ Loading..."
              : "🔄 Refresh"}
          </button>

          <button
            type="button"
            className="admin-add-song-btn"
            onClick={openAddForm}
          >
            ＋ Add Song
          </button>

        </div>

      </div>


      {/* TOTAL SONGS */}

      <div className="admin-song-info-card">

        <div className="admin-song-info-icon">
          🎵
        </div>

        <div>

          <p>
            Total Songs
          </p>

          <h2>
            {songs.length}
          </h2>

        </div>

      </div>


      {/* AUTOMATIC FEATURE CARD */}

      <div className="admin-automatic-song-card">

        <div className="admin-automatic-icon">
          ✨
        </div>

        <div>

          <h3>
            Automatic Learning Features
          </h3>

          <p>
            Difficulty, lyrics, YouTube
            search and Spotify search are
            automatically generated using
            the song title and artist name.
          </p>

        </div>

      </div>


      {/* ADD / EDIT FORM */}

      {showForm && (

        <div className="admin-song-form-card">

          <div className="admin-song-form-header">

            <div>

              <p className="admin-label">
                {editingSong
                  ? "EDIT SONG"
                  : "NEW SONG"}
              </p>

              <h2>
                {editingSong
                  ? "Edit Song"
                  : "Add New Song"}
              </h2>

              <span>
                Enter the song details and
                choose which student should
                receive it.
              </span>

            </div>

            <button
              type="button"
              className="admin-close-btn"
              onClick={closeForm}
              disabled={saving}
            >
              ✕
            </button>

          </div>


          <form
            className="admin-song-form"
            onSubmit={handleSubmit}
          >

            {/* SONG TITLE */}

            <div className="admin-form-group">

              <label>
                Song Title *
              </label>

              <input
                type="text"
                name="title"
                placeholder="Example: En Jeevan"
                value={form.title}
                onChange={handleChange}
                required
              />

            </div>


            {/* ARTIST */}

            <div className="admin-form-group">

              <label>
                Artist *
              </label>

              <input
                type="text"
                name="artist"
                placeholder="Example: Hariharan"
                value={form.artist}
                onChange={handleChange}
                required
              />

            </div>


            {/* COURSE */}

            <div className="admin-form-group">

              <label>
                Course / Category
              </label>

              <select
                name="course"
                value={form.course}
                onChange={handleChange}
              >

                <option value="Vocal Training">
                  Vocal Training
                </option>

                <option value="Guitar">
                  Guitar
                </option>

                <option value="Piano">
                  Piano
                </option>

                <option value="Keyboard">
                  Keyboard
                </option>

                <option value="Music Theory">
                  Music Theory
                </option>

              </select>

            </div>


            {/* STUDENT */}

            <div className="admin-form-group">

              <label>
                Assign to Student
              </label>

              <select
                name="assignedStudentId"
                value={
                  form.assignedStudentId
                }
                onChange={handleChange}
              >

                <option value="">
                  All Students
                </option>

                {studentLoading ? (

                  <option disabled>
                    Loading students...
                  </option>

                ) : (

                  students.map(
                    student => {

                      const studentId =
                        getStudentId(
                          student
                        )

                      return (
                        <option
                          key={
                            studentId
                          }
                          value={
                            studentId
                          }
                        >
                          {student.name}
                          {" — "}
                          {student.email}
                        </option>
                      )
                    }
                  )

                )}

              </select>

              <small>
                Choose a student to assign
                this song specifically to them.
              </small>

            </div>


            {/* AUTOMATIC DIFFICULTY */}

            <div className="admin-automatic-field">

              <div className="admin-automatic-field-icon">
                ✨
              </div>

              <div>

                <strong>
                  Difficulty is Automatic
                </strong>

                <p>
                  The system automatically
                  calculates the difficulty
                  from the song details.
                </p>

              </div>

            </div>


            {/* INSTRUCTIONS */}

            <div className="admin-form-group admin-form-full">

              <label>
                Learning Instructions
              </label>

              <textarea
                name="instructions"
                placeholder="Example: Practice the chorus first..."
                value={form.instructions}
                onChange={handleChange}
                rows="5"
              />

            </div>


            {/* AUTOMATIC RESOURCES */}

            <div className="admin-automatic-info">

              <strong>
                ✨ Automatic Resources
              </strong>

              <p>
                You don't need to enter lyrics
                or audio links manually.
              </p>

              <ul>

                <li>
                  🎯 Difficulty → Automatic
                </li>

                <li>
                  📝 Lyrics → Automatically searched
                </li>

                <li>
                  ▶ YouTube → Automatically searched
                </li>

                <li>
                  🎧 Spotify → Automatically searched
                </li>

              </ul>

            </div>


            {/* FORM BUTTONS */}

            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-save-song-btn"
                disabled={saving}
              >
                {saving
                  ? "⏳ Saving..."
                  : editingSong
                    ? "💾 Update Song"
                    : "💾 Save Song"}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* SONG TABLE */}

      <div className="admin-songs-card">

        <div className="admin-songs-card-header">

          <div>

            <h2>
              Academy Songs
            </h2>

            <p>
              Songs stored in MongoDB
            </p>

          </div>

          <span>
            {filteredSongs.length} songs
          </span>

        </div>


        {/* SEARCH */}

        <div
          style={{
            padding:
              "0 20px 20px"
          }}
        >

          <input
            type="text"
            value={search}
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
            placeholder="🔍 Search song, artist, course or student..."
            style={{
              width: "100%",
              maxWidth: "450px",
              minHeight: "44px",
              padding:
                "10px 14px",
              border:
                "1px solid #ddd",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px"
            }}
          />

        </div>


        {/* LOADING */}

        {loading && (

          <div className="admin-loading">

            <div
              style={{
                fontSize: "28px",
                marginBottom: "10px"
              }}
            >
              ⏳
            </div>

            Loading songs...

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="admin-error">

              {error}

              <button
                type="button"
                onClick={loadSongs}
                style={{
                  marginLeft:
                    "12px"
                }}
              >
                Retry
              </button>

            </div>

          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          songs.length === 0 && (

            <div className="admin-empty">

              <div>
                🎵
              </div>

              <h3>
                No songs found
              </h3>

              <p>
                Add your first song using
                the button above.
              </p>

            </div>

          )}


        {/* SEARCH EMPTY */}

        {!loading &&
          !error &&
          songs.length > 0 &&
          filteredSongs.length === 0 && (

            <div className="admin-empty">

              <div>
                🔍
              </div>

              <h3>
                No matching songs
              </h3>

              <p>
                Try a different song title,
                artist, course or student.
              </p>

            </div>

          )}


        {/* TABLE */}

        {!loading &&
          !error &&
          filteredSongs.length > 0 && (

            <div className="admin-table-wrapper">

              <table className="admin-songs-table">

                <thead>

                  <tr>

                    <th>#</th>
                    <th>Song</th>
                    <th>Artist</th>
                    <th>Course</th>
                    <th>Difficulty</th>
                    <th>Assigned Student</th>
                    <th>Resources</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredSongs.map(
                    (song, index) => {

                      const songId =
                        getSongId(song)

                      return (

                        <tr
                          key={
                            songId ||
                            index
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>


                          {/* SONG */}

                          <td>

                            <div className="admin-song-title-cell">

                              <div className="admin-song-icon">
                                🎵
                              </div>

                              <strong>
                                {song.title ||
                                  "Untitled Song"}
                              </strong>

                            </div>

                          </td>


                          {/* ARTIST */}

                          <td>
                            {song.artist ||
                              "—"}
                          </td>


                          {/* COURSE */}

                          <td>
                            {song.course ||
                              "—"}
                          </td>


                          {/* DIFFICULTY */}

                          <td>

                            <span
                              className={
                                `admin-difficulty-badge ${getDifficultyClass(
                                  song.difficulty
                                )}`
                              }
                            >
                              {song.difficulty ||
                                "Medium"}
                            </span>

                          </td>


                          {/* STUDENT */}

                          <td>

                            <span
                              className={
                                song.assignedStudentId
                                  ? "admin-student-assigned"
                                  : "admin-student-all"
                              }
                            >

                              {song.assignedStudentId
                                ? `👤 ${
                                    song.assignedStudentName ||
                                    getStudentName(
                                      song.assignedStudentId
                                    )
                                  }`
                                : "👥 All Students"}

                            </span>

                          </td>


                          {/* RESOURCES */}

                          <td>

                            <div className="admin-resource-badges">

                              <span>
                                📝 Lyrics
                              </span>

                              <span>
                                ▶ YouTube
                              </span>

                              <span>
                                🎧 Spotify
                              </span>

                            </div>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="admin-song-actions">

                              <button
                                type="button"
                                className="admin-view-btn"
                                onClick={() =>
                                  openView(song)
                                }
                              >
                                👁 View
                              </button>

                              <button
                                type="button"
                                className="admin-edit-btn"
                                onClick={() =>
                                  openEditForm(song)
                                }
                              >
                                ✏ Edit
                              </button>

                              <button
                                type="button"
                                className="admin-delete-btn"
                                onClick={() =>
                                  deleteSong(song)
                                }
                                disabled={
                                  deletingId ===
                                  String(songId)
                                }
                              >
                                {deletingId ===
                                String(songId)
                                  ? "⏳ Deleting..."
                                  : "🗑 Delete"}
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>


      {/* VIEW MODAL */}

      {viewSong && (

        <div
          className="admin-modal-overlay"
          onClick={closeView}
        >

          <div
            className="admin-song-modal"
            onClick={event =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>

                <p className="admin-label">
                  SONG DETAILS
                </p>

                <h2>
                  🎵 {viewSong.title}
                </h2>

              </div>

              <button
                type="button"
                className="admin-close-btn"
                onClick={closeView}
              >
                ✕
              </button>

            </div>


            <div className="admin-modal-content">

              <div className="admin-modal-detail">

                <span>
                  Artist
                </span>

                <strong>
                  {viewSong.artist ||
                    "—"}
                </strong>

              </div>


              <div className="admin-modal-detail">

                <span>
                  Course
                </span>

                <strong>
                  {viewSong.course ||
                    "—"}
                </strong>

              </div>


              <div className="admin-modal-detail">

                <span>
                  Difficulty
                </span>

                <strong>
                  {viewSong.difficulty ||
                    "Medium"}
                </strong>

              </div>


              <div className="admin-modal-detail">

                <span>
                  Assigned Student
                </span>

                <strong>
                  {viewSong.assignedStudentId
                    ? (
                        viewSong.assignedStudentName ||
                        getStudentName(
                          viewSong.assignedStudentId
                        )
                      )
                    : "All Students"}
                </strong>

              </div>


              <div className="admin-modal-detail">

                <span>
                  Instructions
                </span>

                <p>
                  {viewSong.instructions ||
                    "No instructions added."}
                </p>

              </div>


              <div className="admin-modal-automatic">

                <h3>
                  ✨ Automatic Learning Resources
                </h3>

                <p>
                  Students can access learning
                  resources automatically using
                  the song title and artist.
                </p>

                <div>

                  <span>
                    🎯 Automatic Difficulty
                  </span>

                  <span>
                    📝 Automatic Lyrics
                  </span>

                  <span>
                    ▶ YouTube Search
                  </span>

                  <span>
                    🎧 Spotify Search
                  </span>

                </div>

              </div>

            </div>


            <div className="admin-modal-footer">

              <button
                type="button"
                className="admin-cancel-btn"
                onClick={closeView}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminSongs