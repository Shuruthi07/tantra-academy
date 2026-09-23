import "./App.css"
import "./dark-mode.css"

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"


// ========================================
// PUBLIC COMPONENTS
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
// STUDENT
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
import StudentAttendance from "./components/StudentAttendance"


// ========================================
// TEACHER
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
// ADMIN
// ========================================

import AdminDashboard from "./components/AdminDashboard"
import AdminStudents from "./components/AdminStudents"
import AdminTeachers from "./components/AdminTeachers"
import AdminSongs from "./components/AdminSongs"
import AdminTasks from "./components/AdminTasks"
import AdminSchedule from "./components/AdminSchedule"
import AdminFees from "./components/AdminFees"
import AdminEvents from "./components/AdminEvents"
import AdminGallery from "./components/AdminGallery"
import AdminFeedback from "./components/AdminFeedback"
import AdminAttendance from "./components/AdminAttendance"
import AdminNotifications from "././components/AdminNotifications"


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
            PUBLIC
        ================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================
            STUDENT
        ================================== */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-teacher"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentTeacherProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-songs"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <MySongs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/song-learning"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <SongLearning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <EventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gallery"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <GalleryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-attendance"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <Notifications />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            TEACHER
        ================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherLayout />
            </ProtectedRoute>
          }
        >

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
            ADMIN
        ================================== */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-students"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminStudents />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-teachers"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminTeachers />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-songs"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminSongs />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-tasks"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminTasks />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-attendance"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminAttendance />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-schedule"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminSchedule />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-fees"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminFees />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-events"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminEvents />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-gallery"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminGallery />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-feedback"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
          <Route
  path="/admin-notifications"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminNotifications />
    </ProtectedRoute>
  }
/>


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