import { useEffect, useState } from "react"

const defaultSettings = {
  name: "Shuruthi",
  email: "shuruthi@example.com",
  phone: "+91 98765 43210",

  classReminders: true,
  taskReminders: true,
  paymentReminders: true,
  academyAnnouncements: true,

  appearance: "Light"
}


function Settings() {

  const [settings, setSettings] = useState(() => {

    const saved =
      JSON.parse(
        localStorage.getItem("tantraSettings")
      )

    return {
      ...defaultSettings,
      ...(saved || {})
    }

  })


  const [showPasswordForm, setShowPasswordForm] =
    useState(false)

  const [currentPassword, setCurrentPassword] =
    useState("")

  const [newPassword, setNewPassword] =
    useState("")

  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [saved, setSaved] =
    useState(false)


  // =========================================
  // APPLY THEME
  // =========================================

  useEffect(() => {

    function applyTheme(appearance) {

      const root =
        document.documentElement


      if (appearance === "Dark") {

        root.setAttribute(
          "data-theme",
          "dark"
        )

      } else if (appearance === "System") {

        const prefersDark =
          window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches


        root.setAttribute(
          "data-theme",
          prefersDark
            ? "dark"
            : "light"
        )

      } else {

        root.setAttribute(
          "data-theme",
          "light"
        )

      }

    }


    applyTheme(
      settings.appearance
    )

  }, [settings.appearance])


  // =========================================
  // LOAD SETTINGS
  // =========================================

  useEffect(() => {

    function loadSettings() {

      const saved =
        JSON.parse(
          localStorage.getItem(
            "tantraSettings"
          )
        )


      if (saved) {

        setSettings({
          ...defaultSettings,
          ...saved
        })

      }

    }


    window.addEventListener(
      "storage",
      loadSettings
    )

    window.addEventListener(
      "settingsUpdated",
      loadSettings
    )


    return () => {

      window.removeEventListener(
        "storage",
        loadSettings
      )

      window.removeEventListener(
        "settingsUpdated",
        loadSettings
      )

    }

  }, [])


  // =========================================
  // INPUT CHANGE
  // =========================================

  function handleChange(e) {

    const {
      name,
      value
    } = e.target


    setSettings((previous) => ({
      ...previous,
      [name]: value
    }))

  }


  // =========================================
  // CHECKBOX CHANGE
  // =========================================

  function handleCheckboxChange(e) {

    const {
      name,
      checked
    } = e.target


    setSettings((previous) => ({
      ...previous,
      [name]: checked
    }))

  }


  // =========================================
  // APPEARANCE
  // =========================================

  function changeAppearance(
    appearance
  ) {

    setSettings((previous) => ({
      ...previous,
      appearance
    }))


    const currentSettings =
      JSON.parse(
        localStorage.getItem(
          "tantraSettings"
        )
      ) || {}


    localStorage.setItem(
      "tantraSettings",
      JSON.stringify({
        ...currentSettings,
        appearance
      })
    )


    window.dispatchEvent(
      new Event(
        "settingsUpdated"
      )
    )

  }


  // =========================================
  // SAVE SETTINGS
  // =========================================

  function saveSettings() {

    localStorage.setItem(
      "tantraSettings",
      JSON.stringify(settings)
    )


    // Also update student profile
    const loggedInUser =
      JSON.parse(
        localStorage.getItem(
          "tantraLoggedInUser"
        )
      )


    if (loggedInUser) {

      const updatedUser = {
        ...loggedInUser,
        name: settings.name,
        email: settings.email,
        phone: settings.phone
      }


      localStorage.setItem(
        "tantraLoggedInUser",
        JSON.stringify(updatedUser)
      )


      // Update registered account
      const accounts =
        JSON.parse(
          localStorage.getItem(
            "tantraAccounts"
          )
        ) || []


      const updatedAccounts =
        accounts.map((account) => {

          if (
            account.id === loggedInUser.id ||
            account.email === loggedInUser.email
          ) {

            return {
              ...account,
              name: settings.name,
              email: settings.email,
              phone: settings.phone
            }

          }

          return account

        })


      localStorage.setItem(
        "tantraAccounts",
        JSON.stringify(
          updatedAccounts
        )
      )

    }


    window.dispatchEvent(
      new Event(
        "settingsUpdated"
      )
    )


    setSaved(true)


    setTimeout(() => {
      setSaved(false)
    }, 2500)

  }


  // =========================================
  // CHANGE PASSWORD
  // =========================================

  function handleChangePassword() {

    // Check current password

    if (!currentPassword.trim()) {

      alert(
        "Please enter your current password."
      )

      return

    }


    // Check new password length

    if (newPassword.length < 6) {

      alert(
        "New password must contain at least 6 characters."
      )

      return

    }


    // Check password confirmation

    if (
      newPassword !==
      confirmPassword
    ) {

      alert(
        "New passwords do not match."
      )

      return

    }


    // Get logged-in student

    const loggedInUser =
      JSON.parse(
        localStorage.getItem(
          "tantraLoggedInUser"
        )
      )


    if (!loggedInUser) {

      alert(
        "Student session not found. Please login again."
      )

      return

    }


    // Get registered accounts

    const accounts =
      JSON.parse(
        localStorage.getItem(
          "tantraAccounts"
        )
      ) || []


    // Find current student

    const accountIndex =
      accounts.findIndex(
        (account) =>
          account.id ===
            loggedInUser.id ||
          account.email ===
            loggedInUser.email
      )


    if (accountIndex === -1) {

      alert(
        "Student account not found."
      )

      return

    }


    // Check old password

    if (
      accounts[accountIndex].password !==
      currentPassword
    ) {

      alert(
        "Current password is incorrect."
      )

      return

    }


    // Update password

    const updatedAccounts =
      [...accounts]


    updatedAccounts[accountIndex] = {
      ...updatedAccounts[accountIndex],
      password: newPassword
    }


    localStorage.setItem(
      "tantraAccounts",
      JSON.stringify(
        updatedAccounts
      )
    )


    // Clear form

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    setShowPasswordForm(false)


    alert(
      "Password changed successfully! ✅"
    )

  }


  return (

    <div className="settings-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="settings-header">

        <div>

          <p>
            ACCOUNT SETTINGS
          </p>


          <h1>
            Settings ⚙️
          </h1>


          <span>
            Manage your profile and application preferences.
          </span>

        </div>

      </div>


      {/* =================================
          PROFILE
      ================================= */}

      <div className="settings-card">

        <div className="settings-card-heading">

          <h2>
            👤 Profile Information
          </h2>

          <p>
            Update your personal information.
          </p>

        </div>


        <div className="settings-form">

          <div className="settings-field">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
            />

          </div>


          <div className="settings-field">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />

          </div>


          <div className="settings-field">

            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />

          </div>


          <div className="settings-field">

            <label>
              Role
            </label>

            <input
              type="text"
              value="Student"
              readOnly
            />

          </div>

        </div>

      </div>


      {/* =================================
          NOTIFICATIONS
      ================================= */}

      <div className="settings-card">

        <div className="settings-card-heading">

          <h2>
            🔔 Notifications
          </h2>

          <p>
            Choose which notifications you want to receive.
          </p>

        </div>


        <div className="settings-options">


          <label className="settings-option">

            <div>

              <strong>
                Class Reminders
              </strong>

              <span>
                Get reminders before your classes.
              </span>

            </div>


            <input
              type="checkbox"
              name="classReminders"
              checked={
                settings.classReminders
              }
              onChange={
                handleCheckboxChange
              }
            />

          </label>


          <label className="settings-option">

            <div>

              <strong>
                Task Reminders
              </strong>

              <span>
                Get reminders about pending tasks.
              </span>

            </div>


            <input
              type="checkbox"
              name="taskReminders"
              checked={
                settings.taskReminders
              }
              onChange={
                handleCheckboxChange
              }
            />

          </label>


          <label className="settings-option">

            <div>

              <strong>
                Payment Reminders
              </strong>

              <span>
                Receive fee due-date reminders.
              </span>

            </div>


            <input
              type="checkbox"
              name="paymentReminders"
              checked={
                settings.paymentReminders
              }
              onChange={
                handleCheckboxChange
              }
            />

          </label>


          <label className="settings-option">

            <div>

              <strong>
                Academy Announcements
              </strong>

              <span>
                Receive important academy updates.
              </span>

            </div>


            <input
              type="checkbox"
              name="academyAnnouncements"
              checked={
                settings.academyAnnouncements
              }
              onChange={
                handleCheckboxChange
              }
            />

          </label>

        </div>

      </div>


      {/* =================================
          APPEARANCE
      ================================= */}

      <div className="settings-card">

        <div className="settings-card-heading">

          <h2>
            🎨 Appearance
          </h2>

          <p>
            Customize how Tantra Academy looks.
          </p>

        </div>


        <div className="appearance-options">


          <button
            type="button"
            className={
              settings.appearance === "Light"
                ? "appearance-option active"
                : "appearance-option"
            }
            onClick={() =>
              changeAppearance("Light")
            }
          >

            ☀️

            <span>
              Light
            </span>

          </button>


          <button
            type="button"
            className={
              settings.appearance === "Dark"
                ? "appearance-option active"
                : "appearance-option"
            }
            onClick={() =>
              changeAppearance("Dark")
            }
          >

            🌙

            <span>
              Dark
            </span>

          </button>


          <button
            type="button"
            className={
              settings.appearance === "System"
                ? "appearance-option active"
                : "appearance-option"
            }
            onClick={() =>
              changeAppearance("System")
            }
          >

            💻

            <span>
              System
            </span>

          </button>

        </div>

      </div>


      {/* =================================
          SECURITY
      ================================= */}

      <div className="settings-card">

        <div className="settings-card-heading">

          <h2>
            🔒 Security
          </h2>

          <p>
            Keep your account secure.
          </p>

        </div>


        {!showPasswordForm ? (

          <button
            type="button"
            className="change-password-btn"
            onClick={() =>
              setShowPasswordForm(true)
            }
          >
            Change Password
          </button>

        ) : (

          <div className="password-form">


            <div className="settings-field">

              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
              />

            </div>


            <div className="settings-field">

              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Minimum 6 characters"
              />

            </div>


            <div className="settings-field">

              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
              />

            </div>


            <div className="password-actions">

              <button
                type="button"
                className="change-password-btn"
                onClick={
                  handleChangePassword
                }
              >
                Update Password
              </button>


              <button
                type="button"
                className="password-cancel-btn"
                onClick={() => {

                  setShowPasswordForm(false)

                  setCurrentPassword("")

                  setNewPassword("")

                  setConfirmPassword("")

                }}
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </div>


      {/* =================================
          SAVE SUCCESS
      ================================= */}

      {saved && (

        <div className="settings-save-success">

          ✓ Settings saved successfully!

        </div>

      )}


      {/* =================================
          SAVE BUTTON
      ================================= */}

      <button
        type="button"
        className="save-settings-btn"
        onClick={saveSettings}
      >
        💾 Save Changes
      </button>


    </div>

  )

}


export default Settings