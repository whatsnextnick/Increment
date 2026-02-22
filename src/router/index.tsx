import { createBrowserRouter } from 'react-router-dom'
import Providers from '../Providers'
import AuthProtectedRoute from './AuthProtectedRoute'

import HomePage        from '../pages/HomePage'
import SignInPage      from '../pages/auth/SignInPage'
import SignUpPage      from '../pages/auth/SignUpPage'
import NotFoundPage    from '../pages/404Page'

import DashboardPage      from '../pages/dashboard/DashboardPage'
import WorkoutsPage       from '../pages/workouts/WorkoutsPage'
import NewWorkoutPage     from '../pages/workouts/NewWorkoutPage'
import WorkoutDetailPage  from '../pages/workouts/WorkoutDetailPage'
import WeightPage         from '../pages/weight/WeightPage'
import ExercisesPage      from '../pages/exercises/ExercisesPage'
import ProfilePage        from '../pages/profile/ProfilePage'
import ChatPage           from '../pages/chat/ChatPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import KnowledgeBasePage  from '../pages/admin/KnowledgeBasePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Providers />,
    children: [
      // Public
      { path: '/',              element: <HomePage /> },
      { path: '/auth/sign-in',  element: <SignInPage /> },
      { path: '/auth/sign-up',  element: <SignUpPage /> },

      // Protected — requires auth
      {
        path: '/',
        element: <AuthProtectedRoute />,
        children: [
          { path: '/dashboard',        element: <DashboardPage /> },
          { path: '/workouts',         element: <WorkoutsPage /> },
          { path: '/workouts/new',     element: <NewWorkoutPage /> },
          { path: '/workouts/:id',     element: <WorkoutDetailPage /> },
          { path: '/weight',           element: <WeightPage /> },
          { path: '/exercises',        element: <ExercisesPage /> },
          { path: '/chat',             element: <ChatPage /> },
          { path: '/admin',            element: <AdminDashboardPage /> },
          { path: '/admin/knowledge',  element: <KnowledgeBasePage /> },
          { path: '/profile',          element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default router
