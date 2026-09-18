import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function StudentTeacherProfile() {

  const defaultTeacher = {
    name: "M. Shuruthi",
    role: "Music Teacher",
    bio: "Passionate about teaching music and helping students discover their musical potential.",
    specialization: "Music & Vocal Training",
    instagram: "https://www.instagram.com/",
    spotify: "",
    facebook: "",
    youtube: "",
    linkedin: ""
  }


  const [teacher, setTeacher] =
    useState(defaultTeacher)


  // ========================================
  // LOAD TEACHER PROFILE
  // ========================================

  useEffect(() => {

    function loadTeacherProfile() {

      const savedProfile =
        JSON.parse(
          localStorage.getItem(
            "tantraTeacherProfile"
          )
        )

      if (savedProfile) {

        setTeacher({
          ...defaultTeacher,
          ...savedProfile
        })

      } else {

        setTeacher(defaultTeacher)

      }

    }


    loadTeacherProfile()


    window.addEventListener(
      "storage",
      loadTeacherProfile
    )


    window.addEventListener(
      "teacherProfileUpdated",
      loadTeacherProfile
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadTeacherProfile
      )


      window.removeEventListener(
        "teacherProfileUpdated",
        loadTeacherProfile
      )

    }

  }, [])


  return (

    <div className="student-teacher-profile-page">


      {/* ==================================
          HEADER
      ================================== */}

      <div className="student-teacher-profile-header">

        <Link
          to="/student-dashboard"
          className="student-teacher-back-btn"
        >
          ← Back to Dashboard
        </Link>


        <div className="student-teacher-title">

          <p>
            YOUR TEACHER
          </p>

          <h1>
            Teacher Profile
          </h1>

          <span>
            Learn more about your music teacher.
          </span>

        </div>

      </div>



      {/* ==================================
          PROFILE CARD
      ================================== */}

      <div className="student-teacher-profile-card">


        {/* Teacher Avatar */}

        <div className="student-teacher-avatar">
          👩‍🏫
        </div>


        {/* Teacher Information */}

        <div className="student-teacher-info">

          <h2>
            {teacher.name}
          </h2>

          <p className="student-teacher-role">
            {teacher.role}
          </p>


          <div className="student-teacher-specialization">

            <span>
              SPECIALIZATION
            </span>

            <strong>
              {teacher.specialization}
            </strong>

          </div>


          <div className="student-teacher-bio">

            <span>
              ABOUT
            </span>

            <p>
              {teacher.bio}
            </p>

          </div>


          {/* Social Links */}

          <div className="student-teacher-social">

            <span>
              CONNECT
            </span>


            <div className="student-teacher-social-links">

              {teacher.instagram && (

                <a
                  href={teacher.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="student-teacher-social-btn"
                >
                  📷 Instagram
                </a>

              )}


              {teacher.spotify && (

                <a
                  href={teacher.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="student-teacher-social-btn"
                >
                  🎧 Spotify
                </a>

              )}


              {teacher.youtube && (

                <a
                  href={teacher.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="student-teacher-social-btn"
                >
                  ▶ YouTube
                </a>

              )}


              {teacher.facebook && (

                <a
                  href={teacher.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="student-teacher-social-btn"
                >
                  f Facebook
                </a>

              )}


              {teacher.linkedin && (

                <a
                  href={teacher.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="student-teacher-social-btn"
                >
                  in LinkedIn
                </a>

              )}

            </div>

          </div>

        </div>

      </div>



      {/* ==================================
          READ ONLY NOTICE
      ================================== */}

      <div className="student-teacher-readonly">

        <span>
          🔒
        </span>

        <div>

          <strong>
            Teacher Profile
          </strong>

          <p>
            This profile is view-only for students.
            Only the teacher can update their profile.
          </p>

        </div>

      </div>

    </div>

  )

}

export default StudentTeacherProfile