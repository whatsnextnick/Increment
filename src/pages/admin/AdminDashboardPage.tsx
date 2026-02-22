import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { Modal, useModal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabase'

interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  memberUsers: number
}

interface SystemStats {
  totalWorkouts: number
  totalSets: number
  totalVolume: number
  documentsInKB: number
  chatMessages: number
}

interface User {
  id: string
  email: string
  created_at: string
  profiles: {
    display_name: string | null
    role: 'admin' | 'member'
    created_at: string
  }
  last_sign_in_at: string | null
}

export default function AdminDashboardPage() {
  const { profile } = useProfile()
  const { showToast } = useToast()
  const confirmModal = useModal()
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    memberUsers: 0,
  })
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalWorkouts: 0,
    totalSets: 0,
    totalVolume: 0,
    documentsInKB: 0,
    chatMessages: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<{ id: string; role: 'admin' | 'member' } | null>(null)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchStats()
      fetchUsers()
    }
  }, [profile?.role])

  async function fetchStats() {
    try {
      // User stats
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('role, created_at')

      const totalUsers = allUsers?.length || 0
      const adminUsers = allUsers?.filter(u => u.role === 'admin').length || 0
      const memberUsers = allUsers?.filter(u => u.role === 'member').length || 0

      // Active users (logged in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: activeCount } = await supabase
        .from('chat_history')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      // System stats
      const { count: workoutCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })

      const { count: setsCount } = await supabase
        .from('workout_sets')
        .select('*', { count: 'exact', head: true })

      const { data: volumeData } = await supabase
        .from('workout_sets')
        .select('reps, weight_kg')

      const totalVolume = volumeData?.reduce(
        (sum, set) => sum + (set.reps || 0) * (set.weight_kg || 0),
        0
      ) || 0

      const { count: docsCount } = await supabase
        .from('fitness_documents')
        .select('*', { count: 'exact', head: true })

      const { count: chatCount } = await supabase
        .from('chat_history')
        .select('*', { count: 'exact', head: true })

      setUserStats({
        totalUsers,
        activeUsers: activeCount || 0,
        adminUsers,
        memberUsers,
      })

      setSystemStats({
        totalWorkouts: workoutCount || 0,
        totalSets: setsCount || 0,
        totalVolume: Math.round(totalVolume),
        documentsInKB: docsCount || 0,
        chatMessages: chatCount || 0,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          role,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get auth.users data (email, last_sign_in)
      const usersWithAuth = await Promise.all(
        (data || []).map(async profile => {
          const { data: authData } = await supabase.auth.admin.getUserById(profile.id)
          return {
            id: profile.id,
            email: authData?.user?.email || 'N/A',
            created_at: profile.created_at,
            profiles: {
              display_name: profile.display_name,
              role: profile.role,
              created_at: profile.created_at,
            },
            last_sign_in_at: authData?.user?.last_sign_in_at || null,
          }
        })
      )

      setUsers(usersWithAuth)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  function openRoleConfirmation(userId: string, currentRole: 'admin' | 'member') {
    setSelectedUser({ id: userId, role: currentRole })
    confirmModal.open()
  }

  async function toggleUserRole() {
    if (!selectedUser) return

    const newRole = selectedUser.role === 'admin' ? 'member' : 'admin'

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id)

      if (error) throw error

      showToast(`User role updated to ${newRole}`, 'success')
      confirmModal.close()
      setSelectedUser(null)
      fetchUsers()
      fetchStats()
    } catch (err: any) {
      showToast(`Error updating role: ${err.message}`, 'error')
    }
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
            <Badge variant="accent">Admin</Badge>
          </div>
          <p className="mt-1 text-sm text-surface-400">System overview and user management</p>
        </div>

        {/* User Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-brand-500">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Total Users</p>
            <AnimatedNumber value={userStats.totalUsers} className="mt-1 text-2xl font-bold text-slate-100" />
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Active (7d)</p>
            <AnimatedNumber value={userStats.activeUsers} className="mt-1 text-2xl font-bold text-slate-100" />
          </Card>
          <Card className="border-l-4 border-l-accent-500">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Admins</p>
            <AnimatedNumber value={userStats.adminUsers} className="mt-1 text-2xl font-bold text-slate-100" />
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Members</p>
            <AnimatedNumber value={userStats.memberUsers} className="mt-1 text-2xl font-bold text-slate-100" />
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link to="/admin/knowledge">
            <Card className="transition-all hover:border-brand-500 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📚</div>
                <div>
                  <h3 className="font-semibold text-slate-100">Knowledge Base</h3>
                  <p className="text-xs text-surface-400">Manage RAG documents</p>
                </div>
              </div>
            </Card>
          </Link>
          <Card className="opacity-50">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚙️</div>
              <div>
                <h3 className="font-semibold text-slate-100">System Settings</h3>
                <p className="text-xs text-surface-400">Coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        {/* System Stats */}
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">System Statistics</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <p className="text-xs text-surface-400">Workouts Logged</p>
              <AnimatedNumber value={systemStats.totalWorkouts} className="mt-1 text-xl font-bold text-slate-100" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Total Sets</p>
              <AnimatedNumber value={systemStats.totalSets} className="mt-1 text-xl font-bold text-slate-100" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Total Volume</p>
              <AnimatedNumber
                value={systemStats.totalVolume}
                suffix=" kg"
                className="mt-1 text-xl font-bold text-slate-100"
              />
            </div>
            <div>
              <p className="text-xs text-surface-400">KB Documents</p>
              <AnimatedNumber value={systemStats.documentsInKB} className="mt-1 text-xl font-bold text-slate-100" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Chat Messages</p>
              <AnimatedNumber value={systemStats.chatMessages} className="mt-1 text-xl font-bold text-slate-100" />
            </div>
          </div>
        </Card>

        {/* User Management */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">User Management</h2>
            <Button size="sm" variant="secondary" onClick={fetchUsers}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <SkeletonTable rows={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700 text-left text-xs text-surface-400">
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Display Name</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Last Active</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-surface-800 last:border-0">
                      <td className="py-3 text-slate-200">{user.email}</td>
                      <td className="py-3 text-slate-200">
                        {user.profiles.display_name || '-'}
                      </td>
                      <td className="py-3">
                        <Badge variant={user.profiles.role === 'admin' ? 'accent' : 'brand'}>
                          {user.profiles.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-surface-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-surface-400">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-3">
                        {user.id !== profile.id && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openRoleConfirmation(user.id, user.profiles.role)}
                          >
                            Make {user.profiles.role === 'admin' ? 'Member' : 'Admin'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Role Change Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        title="Confirm Role Change"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={confirmModal.close}>
              Cancel
            </Button>
            <Button onClick={toggleUserRole}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to change this user's role to{' '}
          <strong className="text-brand-400">
            {selectedUser?.role === 'admin' ? 'member' : 'admin'}
          </strong>
          ?
        </p>
      </Modal>
    </AppShell>
  )
}
