import "./App.css"
import "./dark-mode.css"

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"


// ========================================
// PUBLIC PAGES
// ========================================

import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Classes from "./components/Classes"
import Events from "./components/Events"
import Gallery from "./components/Gallery"
import About from "./components/About"


// ========================================
// AUTHENTICATION
// ========================================

import Login from "./components/Login"
import Register from "./components/Register"
import ProtectedRoute from "./components/ProtectedRoute"


// ========================================
// STUDENT PAGES
// ========================================

import StudentDashboard from "./components/StudentDashboard"
import StudentTeacherProfile from "./components/StudentTeacherProfile"
import MySongs from "./components/MySongs"
import SongLearning from "./components/SongLearning"
import Tasks from "./components/Tasks"
import Schedule from "./components/Schedule"
import Payments from "./components/Payments"
import EventsPage from "./components/EventsPage"
import MyBookings from "./components/MyBookings"
import GalleryPage from "./components/GalleryPage"
import Feedback from "./components/Feedback"
import History from "./components/History"
import Settings from "./components/Settings"
import Notifications from "./components/Notifications"


// ========================================
// TEACHER PAGES
// ========================================

import TeacherLayout from "./components/TeacherLayout"
import TeacherDashboard from "./components/TeacherDashboard"
import TeacherStudents from "./components/TeacherStudents"
import TeacherAttendance from "./components/TeacherAttendance"
import TeacherSongs from "./components/TeacherSongs"
import TeacherSongProgress from "./components/TeacherSongProgress"
import TeacherTasks from "./components/TeacherTasks"
import TeacherSchedule from "./components/TeacherSchedule"
import TeacherFeedback from "./components/TeacherFeedback"
import TeacherFees from "./components/TeacherFees"
import TeacherEvents from "./components/TeacherEvents"
import TeacherProfile from "./components/TeacherProfile"
import TeacherNotifications from "./components/TeacherNotifications"
import TeacherGallery from "./components/TeacherGallery"


// ========================================
// HOME PAGE
// ========================================

function Home() {

  return (
    <>
      <Navbar />

      <Hero />

      <Classes />

      <Events />

      <Gallery />

      <About />
    </>
  )
}


// ========================================
// APP
// ========================================

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ==================================
            PUBLIC HOME
        ================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ==================================
            AUTHENTICATION
        ================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================
            STUDENT ROUTES
            LOGIN REQUIRED
        ================================== */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/my-teacher"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentTeacherProfile />
            </ProtectedRoute>
          }
        />


        <Route
          path="/my-songs"
          element={
            <ProtectedRoute allowedRole="Student">
              <MySongs />
            </ProtectedRoute>
          }
        />


        <Route
          path="/song-learning"
          element={
            <ProtectedRoute allowedRole="Student">
              <SongLearning />
            </ProtectedRoute>
          }
        />


        <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRole="Student">
              <Tasks />
            </ProtectedRoute>
          }
        />


        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRole="Student">
              <Schedule />
            </ProtectedRoute>
          }
        />


        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRole="Student">
              <Payments />
            </ProtectedRoute>
          }
        />


        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRole="Student">
              <EventsPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRole="Student">
              <MyBookings />
            </ProtectedRoute>
          }
        />


        <Route
          path="/gallery"
          element={
            <ProtectedRoute allowedRole="Student">
              <GalleryPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRole="Student">
              <Feedback />
            </ProtectedRoute>
          }
        />


        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRole="Student">
              <History />
            </ProtectedRoute>
          }
        />


        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRole="Student">
              <Settings />
            </ProtectedRoute>
          }
        />


        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRole="Student">
              <Notifications />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            TEACHER ROUTES
            COMMON TEACHER LAYOUT
            NO LOGIN REQUIRED
        ================================== */}

        <Route element={<TeacherLayout />}>

          <Route
            path="/teacher-dashboard"
            element={<TeacherDashboard />}
          />

          <Route
            path="/teacher-profile"
            element={<TeacherProfile />}
          />

          <Route
            path="/teacher-students"
            element={<TeacherStudents />}
          />

          <Route
            path="/teacher-attendance"
            element={<TeacherAttendance />}
          />

          <Route
            path="/teacher-fees"
            element={<TeacherFees />}
          />

          <Route
            path="/teacher-events"
            element={<TeacherEvents />}
          />

          <Route
            path="/teacher-songs"
            element={<TeacherSongs />}
          />

          <Route
            path="/teacher-song-progress"
            element={<TeacherSongProgress />}
          />

          <Route
            path="/teacher-tasks"
            element={<TeacherTasks />}
          />

          <Route
            path="/teacher-schedule"
            element={<TeacherSchedule />}
          />

          <Route
            path="/teacher-feedback"
            element={<TeacherFeedback />}
          />

          <Route
            path="/teacher-notifications"
            element={<TeacherNotifications />}
          />

          <Route
            path="/teacher-gallery"
            element={<TeacherGallery />}
          />

        </Route>


        {/* ==================================
            FALLBACK
        ================================== */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>

    </BrowserRouter>
  )
}


export default App