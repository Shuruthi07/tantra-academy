import {
  useEffect,
  useState
} from "react"

import {
  useNavigate,
  useSearchParams
} from "react-router-dom"


const SONGS_API =
  "http://127.0.0.1:5000/api/admin/songs"


const PROGRESS_API =
  "http://127.0.0.1:5000/api/song-progress"


const LYRICS_API =
  "https://tantra-academy.onrender.com/api/lyrics"


// =====================================================
// AUTH HEADERS
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
// COMPONENT
// =====================================================

function SongLearning() {

  const navigate =
    useNavigate()

  const [searchParams] =
    useSearchParams()


  const [foundSong, setFoundSong] =
    useState(null)


  const [songLoading, setSongLoading] =
    useState(true)


  const [automaticLyrics, setAutomaticLyrics] =
    useState("")


  const [lyricsLoading, setLyricsLoading] =
    useState(false)


  const [lyricsError, setLyricsError] =
    useState("")


  const [progress, setProgress] =
    useState(0)


  const [message, setMessage] =
    useState("")


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
        "User loading error:",
        error
      )

      return null

    }

  }


  // =====================================================
  // LOAD SONG
  // =====================================================

  useEffect(() => {

    const songId =
      searchParams.get("id") ||
      searchParams.get("songId")


    async function loadSong() {

      setSongLoading(true)
      setMessage("")


      try {

        const token =
          sessionStorage.getItem(
            "tantraAuthToken"
          )


        if (!token) {

          throw new Error(
            "Your login session has expired. Please login again."
          )

        }


        // =============================================
        // LOAD SONGS WITH JWT
        // =============================================

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


        const mongoSongs =
          Array.isArray(
            data.songs
          )
            ? data.songs
            : []


        const selectedSong =
          mongoSongs.find(
            song =>
              String(
                song.id ||
                song._id
              ) ===
              String(
                songId
              )
          )


        if (!selectedSong) {

          setFoundSong(
            null
          )

          return

        }


        const formattedSong = {

          ...selectedSong,

          id:
            selectedSong.id ||
            selectedSong._id,

          category:
            selectedSong.category ||
            selectedSong.course ||
            "Music",

          course:
            selectedSong.course ||
            selectedSong.category ||
            "Music",

          difficulty:
            selectedSong.difficulty ||
            "Medium"

        }


        setFoundSong(
          formattedSong
        )


        // =============================================
        // LOAD STUDENT PROGRESS
        // =============================================

        const loggedInUser =
          getLoggedInUser()


        const studentId =
          String(
            loggedInUser?.id ||
            loggedInUser?._id ||
            ""
          )


        if (!studentId) {

          setProgress(0)

          return

        }


        try {

          const progressResponse =
            await fetch(
              `${PROGRESS_API}?studentId=${encodeURIComponent(
                studentId
              )}&songId=${encodeURIComponent(
                formattedSong.id
              )}`,
              {
                method: "GET",

                headers:
                  getAuthHeaders(),

                cache:
                  "no-store"
              }
            )


          const progressData =
            await progressResponse.json()


          console.log(
            "Loaded progress:",
            progressData
          )


          if (
            progressResponse.ok &&
            Array.isArray(
              progressData.progress
            ) &&
            progressData.progress.length > 0
          ) {

            const savedProgress =
              progressData.progress[0]


            setProgress(
              Number(
                savedProgress.progress ||
                0
              )
            )

          } else {

            setProgress(0)

          }

        } catch (error) {

          console.error(
            "MongoDB progress loading error:",
            error
          )

          setProgress(0)

        }


      } catch (error) {

        console.error(
          "Song loading error:",
          error
        )


        setFoundSong(
          null
        )


        setMessage(
          error.message ||
          "Unable to load song."
        )

      } finally {

        setSongLoading(
          false
        )

      }

    }


    loadSong()

  }, [searchParams])


  // =====================================================
  // AUTOMATIC LYRICS
  // =====================================================

  useEffect(() => {

    if (!foundSong) {
      return
    }


    if (
      !foundSong.title ||
      !foundSong.artist
    ) {

      return

    }


    async function fetchLyrics() {

      setLyricsLoading(
        true
      )

      setLyricsError(
        ""
      )

      setAutomaticLyrics(
        ""
      )


      try {

        const url =
          `${LYRICS_API}?song=${encodeURIComponent(
            foundSong.title
          )}&artist=${encodeURIComponent(
            foundSong.artist
          )}`


        const response =
          await fetch(
            url
          )


        const data =
          await response.json()


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Lyrics not found"
          )

        }


        setAutomaticLyrics(
          data.lyrics ||
          ""
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

        setLyricsLoading(
          false
        )

      }

    }


    fetchLyrics()

  }, [foundSong])


  // =====================================================
  // UPDATE STUDENT PROGRESS IN MONGODB
  // =====================================================

  async function updateProgress(
    newProgress
  ) {

    const safeProgress =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            newProgress
          )
        )
      )


    // Update UI immediately

    setProgress(
      safeProgress
    )


    if (!foundSong) {
      return
    }


    // ==========================================
    // GET LOGGED-IN STUDENT
    // ==========================================

    const loggedInUser =
      getLoggedInUser()


    if (!loggedInUser) {

      setMessage(
        "Please log in again to save your progress."
      )

      return

    }


    // Support both id and _id

    const studentId =
      String(
        loggedInUser.id ||
        loggedInUser._id ||
        ""
      )


    const studentName =
      loggedInUser.name ||
      "Student"


    if (!studentId) {

      console.error(
        "Student ID missing:",
        loggedInUser
      )


      setMessage(
        "Student account information is missing. Please login again."
      )

      return

    }


    // ==========================================
    // GET JWT TOKEN
    // ==========================================

    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )


    if (!token) {

      setMessage(
        "Login session expired. Please login again."
      )

      return

    }


    // ==========================================
    // SAVE PROGRESS TO MONGODB
    // ==========================================

    try {

      const progressPayload = {

        songId:
          String(
            foundSong.id ||
            foundSong._id
          ),

        studentId:
          studentId,

        studentName:
          studentName,

        progress:
          safeProgress

      }


      console.log(
        "Saving song progress:",
        progressPayload
      )


      const response =
        await fetch(
          `${PROGRESS_API}/update`,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify(
                progressPayload
              )
          }
        )


      const data =
        await response.json()


      console.log(
        "Progress API response:",
        data
      )


      if (
        !response.ok ||
        data.success === false
      ) {

        throw new Error(
          data.message ||
          "Unable to save progress."
        )

      }


      // ==========================================
      // NOTIFY OTHER COMPONENTS
      // ==========================================

      window.dispatchEvent(
        new Event(
          "progressUpdated"
        )
      )


      // ==========================================
      // SUCCESS MESSAGE
      // ==========================================

      if (
        safeProgress >= 100
      ) {

        setMessage(
          "🎉 Song completed successfully!"
        )

      } else {

        setMessage(
          "Progress saved to MongoDB successfully! ✅"
        )

      }


    } catch (error) {

      console.error(
        "MongoDB progress update error:",
        error
      )


      setMessage(
        error.message ||
        "Unable to save progress."
      )

    }

  }


  // =====================================================
  // COMPLETE SONG
  // =====================================================

  function handleComplete() {

    updateProgress(
      100
    )

  }


  // =====================================================
  // YOUTUBE SEARCH
  // =====================================================

  function openYouTube() {

    if (!foundSong) {
      return
    }


    const searchText =
      encodeURIComponent(
        `${foundSong.title} ${foundSong.artist}`
      )


    window.open(
      `https://www.youtube.com/results?search_query=${searchText}`,
      "_blank"
    )

  }


  // =====================================================
  // SPOTIFY SEARCH
  // =====================================================

  function openSpotify() {

    if (!foundSong) {
      return
    }


    const searchText =
      encodeURIComponent(
        `${foundSong.title} ${foundSong.artist}`
      )


    window.open(
      `https://open.spotify.com/search/${searchText}`,
      "_blank"
    )

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (songLoading) {

    return (

      <div className="song-learning-page">

        <div className="song-learning-container">

          <div className="song-learning-card">

            <h2>
              Loading song...
            </h2>

            <p>
              Getting your song details.
            </p>

          </div>

        </div>

      </div>

    )

  }


  // =====================================================
  // SONG NOT FOUND
  // =====================================================

  if (!foundSong) {

    return (

      <div className="song-learning-page">

        <div className="song-learning-container">

          <div className="song-learning-card">

            <h2>
              Song not found
            </h2>


            {message && (

              <p
                style={{
                  color: "#d32f2f",
                  margin:
                    "12px 0"
                }}
              >
                {message}
              </p>

            )}


            <button
              className="secondary-button"

              onClick={() =>
                navigate(
                  "/my-songs"
                )
              }
            >

              ← Back to My Songs

            </button>

          </div>

        </div>

      </div>

    )

  }


  // =====================================================
  // STATUS
  // =====================================================

  let status =
    "Not Started"


  if (
    progress >= 100
  ) {

    status =
      "Completed"

  } else if (
    progress > 0
  ) {

    status =
      "Learning"

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="song-learning-page">

      <div className="song-learning-container">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="song-learning-header">

          <button
            className="back-button"

            onClick={() =>
              navigate(
                "/my-songs"
              )
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


        {/* =============================================
            SONG INFORMATION
        ============================================= */}

        <div className="song-learning-card">

          <div className="song-info-grid">

            <div>

              <span className="info-label">
                Category
              </span>


              <strong>
                {foundSong.category ||
                  foundSong.course ||
                  "Music"}
              </strong>

            </div>


            <div>

              <span className="info-label">
                Difficulty
              </span>


              <strong>
                {foundSong.difficulty ||
                  "Medium"}
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


        {/* =============================================
            PROGRESS
        ============================================= */}

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
                width:
                  `${progress}%`
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

              onClick={
                handleComplete
              }
            >

              ✓ Mark Completed

            </button>

          </div>


          {message && (

            <div
              className={
                message.includes(
                  "successfully"
                )
                  ? "success-message"
                  : "lyrics-error"
              }
              style={{
                marginTop:
                  "16px"
              }}
            >

              {message}

            </div>

          )}

        </div>


        {/* =============================================
            AUTOMATIC LYRICS
        ============================================= */}

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


        {/* =============================================
            MUSIC SEARCH
        ============================================= */}

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

              onClick={
                openYouTube
              }
            >

              ▶ Search on YouTube

            </button>


            <button
              className="secondary-button"

              onClick={
                openSpotify
              }
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


        {/* =============================================
            SONG DETAILS
        ============================================= */}

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
                {foundSong.category ||
                  foundSong.course ||
                  "Music"}
              </strong>

            </div>


            <div>

              <span>
                Difficulty
              </span>


              <strong>
                {foundSong.difficulty ||
                  "Medium"}
              </strong>

            </div>


            {foundSong.instructions && (

              <div>

                <span>
                  Teacher Instructions
                </span>


                <strong>
                  {foundSong.instructions}
                </strong>

              </div>

            )}

          </div>

        </div>


        {/* =============================================
            BACK BUTTON
        ============================================= */}

        <div className="song-learning-footer">

          <button
            className="secondary-button"

            onClick={() =>
              navigate(
                "/my-songs"
              )
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