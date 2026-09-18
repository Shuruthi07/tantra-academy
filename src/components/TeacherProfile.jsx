import { useState } from "react"

function TeacherProfile() {
  const [profile, setProfile] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("tantraTeacherProfile")) || {
        name: "M. Shuruthi",
        role: "Music Teacher",
        bio: "Passionate about teaching music and helping students discover their musical potential.",
        specialization: "Music & Vocal Training",
        instagram: "https://www.instagram.com/shuruthi_ms_005_/",
        spotify: "",
        facebook: "",
        youtube: "",
        linkedin: ""
      }
    )
  })

  const [saved, setSaved] = useState(false)

  function handleChange(e) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })
    setSaved(false)
  }

  function saveProfile(e) {
    e.preventDefault()

    localStorage.setItem(
      "tantraTeacherProfile",
      JSON.stringify(profile)
    )

    setSaved(true)
  }

  return (
    <section className="teacher-profile-page">

      <div className="teacher-profile-header">
        <div>
          <p>TEACHER PROFILE</p>
          <h1>My Profile 👩‍🏫</h1>
          <span>Manage your profile and social media links.</span>
        </div>
      </div>

      <div className="teacher-profile-container">

        {/* Profile Card */}
        <div className="teacher-profile-card">

          <div className="teacher-avatar">
            MS
          </div>

          <h2>{profile.name}</h2>

          <p className="teacher-role">
            {profile.role}
          </p>

          <p className="teacher-bio">
            {profile.bio}
          </p>

          <div className="teacher-specialization">
            <span>Specialization</span>
            <strong>{profile.specialization}</strong>
          </div>

          <div className="teacher-social-preview">

            <h3>Social & Music</h3>

            <div className="social-preview-links">

              {profile.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  📸 Instagram
                </a>
              )}

              {profile.spotify && (
                <a
                  href={profile.spotify}
                  target="_blank"
                  rel="noreferrer"
                >
                  🎵 Spotify
                </a>
              )}

              {profile.facebook && (
                <a
                  href={profile.facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  📘 Facebook
                </a>
              )}

              {profile.youtube && (
                <a
                  href={profile.youtube}
                  target="_blank"
                  rel="noreferrer"
                >
                  ▶️ YouTube
                </a>
              )}

              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  💼 LinkedIn
                </a>
              )}

            </div>
          </div>

        </div>

        {/* Edit Profile */}
        <div className="teacher-profile-form-card">

          <h2>Edit Profile</h2>
          <p className="form-subtitle">
            Update your teacher information and social links.
          </p>

          <form onSubmit={saveProfile}>

            <div className="profile-form-group">
              <label>Teacher Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={profile.specialization}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <h3 className="social-form-title">
              Social & Music Links
            </h3>

            <div className="social-input">
              <label>📸 Instagram</label>
              <input
                type="url"
                name="instagram"
                value={profile.instagram}
                onChange={handleChange}
                placeholder="https://www.instagram.com/shuruthi_ms_005_/"
              />
            </div>

            <div className="social-input">
              <label>🎵 Spotify</label>
              <input
                type="url"
                name="spotify"
                value={profile.spotify}
                onChange={handleChange}
                placeholder="Spotify profile link"
              />
            </div>

            <div className="social-input">
              <label>📘 Facebook</label>
              <input
                type="url"
                name="facebook"
                value={profile.facebook}
                onChange={handleChange}
                placeholder="Facebook profile link"
              />
            </div>

            <div className="social-input">
              <label>▶️ YouTube</label>
              <input
                type="url"
                name="youtube"
                value={profile.youtube}
                onChange={handleChange}
                placeholder="YouTube channel link"
              />
            </div>

            <div className="social-input">
              <label>💼 LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={profile.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn profile link"
              />
            </div>

            <button
              type="submit"
              className="save-profile-btn"
            >
              💾 Save Profile
            </button>

            {saved && (
              <div className="profile-saved-message">
                ✓ Profile saved successfully!
              </div>
            )}

          </form>

        </div>

      </div>

    </section>
  )
}

export default TeacherProfile