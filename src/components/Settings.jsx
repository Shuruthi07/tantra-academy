import { useEffect, useState } from "react"

const API_URL =
  "https://tantra-academy-1.onrender.com/api/auth"

const defaultSettings = {
  name: "",
  email: "",
  phone: "",
  classReminders: true,
  taskReminders: true,
  paymentReminders: true,
  academyAnnouncements: true,
  appearance: "Light"
}

function Settings() {
  const [settings, setSettings] =
    useState(defaultSettings)

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

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  function getAuthHeaders() {
    const token =
      sessionStorage.getItem(
        "tantraAuthToken"
      )

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization:
              "Bearer " + token
          }
        : {})
    }
  }

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  function getCurrentUser() {
    try {
      const currentUser =
        sessionStorage.getItem(
          "tantraCurrentUser"
        )

      if (currentUser) {
        return JSON.parse(currentUser)
      }

      const loggedUser =
        sessionStorage.getItem(
          "tantraLoggedInUser"
        )

      if (loggedUser) {
        return JSON.parse(loggedUser)
      }
    } catch (error) {
      console.error(
        "User session error:",
        error
      )
    }

    return null
  }

  // =====================================================
  // APPLY APPEARANCE
  // =====================================================

  useEffect(() => {
    function applyTheme(appearance) {
      const root =
        document.documentElement

      if (appearance === "Dark") {
        root.setAttribute(
          "data-theme",
          "dark"
        )
      } else if (
        appearance === "System"
      ) {
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

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  async function loadProfile() {
    try {
      setLoading(true)

      const response =
        await fetch(
          `${API_URL}/me`,
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
        "Settings profile:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success ||
        !data.user
      ) {
        throw new Error(
          data.message ||
            "Unable to load profile."
        )
      }

      const user =
        data.user

      let savedPreferences = {}

      try {
        const stored =
          localStorage.getItem(
            "tantraSettings"
          )

        if (stored) {
          savedPreferences =
            JSON.parse(stored)
        }
      } catch {
        savedPreferences = {}
      }

      setSettings({
        ...defaultSettings,
        ...savedPreferences,

        name:
          user.name || "",

        email:
          user.email || "",

        phone:
          user.phone || ""
      })

      // Keep session user updated

      sessionStorage.setItem(
        "tantraCurrentUser",
        JSON.stringify(user)
      )

      sessionStorage.setItem(
        "tantraLoggedInUser",
        JSON.stringify(user)
      )
    } catch (error) {
      console.error(
        "Settings loading error:",
        error
      )

      const user =
        getCurrentUser()

      if (user) {
        setSettings(
          previous => ({
            ...previous,

            name:
              user.name || "",

            email:
              user.email || "",

            phone:
              user.phone || ""
          })
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfile()

    function handleSettingsUpdated() {
      loadProfile()
    }

    window.addEventListener(
      "settingsUpdated",
      handleSettingsUpdated
    )

    return () => {
      window.removeEventListener(
        "settingsUpdated",
        handleSettingsUpdated
      )
    }
  }, [])

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  function handleChange(event) {
    const {
      name,
      value
    } = event.target

    setSettings(
      previous => ({
        ...previous,
        [name]: value
      })
    )
  }

  // =====================================================
  // CHECKBOX CHANGE
  // =====================================================

  function handleCheckboxChange(event) {
    const {
      name,
      checked
    } = event.target

    setSettings(
      previous => ({
        ...previous,
        [name]: checked
      })
    )
  }

  // =====================================================
  // APPEARANCE
  // =====================================================

  function changeAppearance(
    appearance
  ) {
    setSettings(
      previous => ({
        ...previous,
        appearance
      })
    )

    try {
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
    } catch {
      // Ignore local preference error
    }

    window.dispatchEvent(
      new Event(
        "settingsUpdated"
      )
    )
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function saveSettings() {
    if (!settings.name.trim()) {
      alert(
        "Please enter your name."
      )
      return
    }

    if (!settings.email.trim()) {
      alert(
        "Please enter your email."
      )
      return
    }

    try {
      setSaving(true)

      const response =
        await fetch(
          `${API_URL}/profile`,
          {
            method: "PUT",

            headers:
              getAuthHeaders(),

            body: JSON.stringify({
              name:
                settings.name.trim(),

              email:
                settings.email
                  .trim()
                  .toLowerCase(),

              phone:
                settings.phone.trim()
            })
          }
        )

      const data =
        await response.json()

      console.log(
        "Save profile:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save profile."
        )
      }

      const updatedUser =
        data.user

      if (updatedUser) {
        sessionStorage.setItem(
          "tantraCurrentUser",
          JSON.stringify(
            updatedUser
          )
        )

        sessionStorage.setItem(
          "tantraLoggedInUser",
          JSON.stringify(
            updatedUser
          )
        )
      }

      // Save preferences locally

      localStorage.setItem(
        "tantraSettings",
        JSON.stringify({
          classReminders:
            settings.classReminders,

          taskReminders:
            settings.taskReminders,

          paymentReminders:
            settings.paymentReminders,

          academyAnnouncements:
            settings.academyAnnouncements,

          appearance:
            settings.appearance
        })
      )

      window.dispatchEvent(
        new Event(
          "settingsUpdated"
        )
      )

      window.dispatchEvent(
        new Event(
          "studentProfileUpdated"
        )
      )

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 2500)
    } catch (error) {
      console.error(
        "Save settings error:",
        error
      )

      alert(
        error.message ||
          "Unable to save settings."
      )
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async function handleChangePassword() {
    if (!currentPassword.trim()) {
      alert(
        "Please enter your current password."
      )
      return
    }

    if (newPassword.length < 6) {
      alert(
        "New password must contain at least 6 characters."
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "New passwords do not match."
      )
      return
    }

    try {
      setSaving(true)

      const response =
        await fetch(
          `${API_URL}/change-password`,
          {
            method: "PUT",

            headers:
              getAuthHeaders(),

            body: JSON.stringify({
              currentPassword,
              newPassword
            })
          }
        )

      const data =
        await response.json()

      console.log(
        "Change password:",
        response.status,
        data
      )

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to change password."
        )
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setShowPasswordForm(false)

      alert(
        "Password changed successfully! ✅"
      )
    } catch (error) {
      console.error(
        "Password change error:",
        error
      )

      alert(
        error.message ||
          "Unable to change password."
      )
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // CURRENT USER ROLE
  // =====================================================

  const currentUser =
    getCurrentUser()

  const userRole =
    String(
      currentUser?.role ||
        currentUser?.accountType ||
        "Student"
    )
      .trim()

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">

        <div>

          <p>
            ACCOUNT SETTINGS
          </p>

          <h1>
            Settings ⚙️
          </h1>

          <span>
            Manage your profile and
            application preferences.
          </span>

        </div>

      </div>

      {/* PROFILE */}

      <div className="settings-card">

        <div className="settings-card-heading">

          <h2>
            👤 Profile Information
          </h2>

          <p>
            Update your personal information.
          </p>

        </div>

        {loading ? (

          <p>
            Loading profile...
          </p>

        ) : (

          <div className="settings-form">

            <div className="settings-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  settings.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your full name"
              />

            </div>

            <div className="settings-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  settings.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your email"
              />

            </div>

            <div className="settings-field">

              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={
                  settings.phone
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your phone number"
              />

            </div>

            <div className="settings-field">

              <label>
                Role
              </label>

              <input
                type="text"
                value={userRole}
                readOnly
              />

            </div>

          </div>

        )}

      </div>

      {/* NOTIFICATIONS */}

      <div className="settings-card">

        <div className="settings-card-heading">

          <h2>
            🔔 Notifications
          </h2>

          <p>
            Choose which notifications you
            want to receive.
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

      {/* APPEARANCE */}

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
              settings.appearance ===
              "Light"
                ? "appearance-option active"
                : "appearance-option"
            }
            onClick={() =>
              changeAppearance(
                "Light"
              )
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
              settings.appearance ===
              "Dark"
                ? "appearance-option active"
                : "appearance-option"
            }
            onClick={() =>
              changeAppearance(
                "Dark"
              )
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
              settings.appearance ===
              "System"
                ? "appearance-option active"
                : "appearance-option"
            }
            onClick={() =>
              changeAppearance(
                "System"
              )
            }
          >
            💻

            <span>
              System
            </span>

          </button>

        </div>

      </div>

      {/* SECURITY */}

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
              setShowPasswordForm(
                true
              )
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
                value={
                  currentPassword
                }
                onChange={event =>
                  setCurrentPassword(
                    event.target.value
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
                value={
                  newPassword
                }
                onChange={event =>
                  setNewPassword(
                    event.target.value
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
                value={
                  confirmPassword
                }
                onChange={event =>
                  setConfirmPassword(
                    event.target.value
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
                disabled={saving}
              >
                {saving
                  ? "Updating..."
                  : "Update Password"}
              </button>

              <button
                type="button"
                className="password-cancel-btn"
                onClick={() => {
                  setShowPasswordForm(
                    false
                  )

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

      {/* SUCCESS */}

      {saved && (
        <div className="settings-save-success">
          ✓ Settings saved successfully!
        </div>
      )}

      {/* SAVE */}

      <button
        type="button"
        className="save-settings-btn"
        onClick={
          saveSettings
        }
        disabled={
          saving ||
          loading
        }
      >
        {saving
          ? "Saving..."
          : "💾 Save Changes"}
      </button>

    </div>
  )
}

export default Settings