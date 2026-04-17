'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Member {
  member_id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'inactive' | 'banned';
  created_at: string;
  last_login: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.members) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (memberId: string, newStatus: string) => {
    setActionLoading(memberId);
    try {
      const res = await fetch(`/api/admin/users/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, status: newStatus }),
      });
      
      if (res.ok) {
        setMembers(members.map(m => 
          m.member_id === memberId ? { ...m, status: newStatus as Member['status'] } : m
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
        <div className="text-amber-100 text-xl">Loading...</div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
        <div className="text-amber-100 text-2xl mb-4">Access Denied</div>
        <p className="text-amber-200/70 mb-6">You need admin privileges to access this page.</p>
        <Link href="/decks" className="text-amber-400 hover:text-amber-300">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const filteredMembers = filter === 'all' 
    ? members 
    : members.filter(m => m.status === filter);

  const pendingCount = members.filter(m => m.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'banned': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
      <header className="flex justify-between items-center p-4 border-b border-amber-700/30">
        <div className="flex items-center gap-4">
          <Link href="/decks" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-amber-100">Admin: User Management</h1>
        </div>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
              {pendingCount} pending
            </span>
          )}
          <span className="text-amber-200/70 text-sm">
            {session?.user?.name}
          </span>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'active', 'inactive', 'banned'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-900/30 text-amber-200/70 hover:bg-amber-900/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 opacity-70">
                  ({members.filter(m => m.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-amber-950/50 rounded-xl border border-amber-700/30 overflow-hidden">
          <table className="w-full">
            <thead className="bg-amber-900/30">
              <tr>
                <th className="text-left px-4 py-3 text-amber-200/70 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-amber-200/70 text-sm font-medium">Email</th>
                <th className="text-left px-4 py-3 text-amber-200/70 text-sm font-medium">Role</th>
                <th className="text-left px-4 py-3 text-amber-200/70 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-amber-200/70 text-sm font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-amber-200/70 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-8 text-amber-200/50">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.member_id} className="border-t border-amber-700/20">
                    <td className="px-4 py-3">
                      <div className="text-amber-100 font-medium">{member.name}</div>
                      <div className="text-amber-200/30 text-xs">{member.member_id}</div>
                    </td>
                    <td className="px-4 py-3 text-amber-200/70 text-sm">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        member.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-amber-700/30 text-amber-300'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-amber-200/50 text-sm">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {member.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(member.member_id, 'active')}
                              disabled={actionLoading === member.member_id}
                              className="text-xs px-3 py-1 rounded bg-green-600/50 hover:bg-green-600 text-green-200 disabled:opacity-50 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(member.member_id, 'banned')}
                              disabled={actionLoading === member.member_id}
                              className="text-xs px-3 py-1 rounded bg-red-600/50 hover:bg-red-600 text-red-200 disabled:opacity-50 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {member.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(member.member_id, 'banned')}
                            disabled={actionLoading === member.member_id}
                            className="text-xs px-3 py-1 rounded bg-red-600/50 hover:bg-red-600 text-red-200 disabled:opacity-50 transition"
                          >
                            Ban
                          </button>
                        )}
                        {member.status === 'banned' && (
                          <button
                            onClick={() => handleUpdateStatus(member.member_id, 'active')}
                            disabled={actionLoading === member.member_id}
                            className="text-xs px-3 py-1 rounded bg-green-600/50 hover:bg-green-600 text-green-200 disabled:opacity-50 transition"
                          >
                            Unban
                          </button>
                        )}
                        {(member.status === 'active' || member.status === 'banned') && member.role === 'user' && (
                          <button
                            onClick={() => handleUpdateStatus(member.member_id, member.status === 'active' ? 'inactive' : 'active')}
                            disabled={actionLoading === member.member_id}
                            className="text-xs px-3 py-1 rounded bg-amber-600/50 hover:bg-amber-600 text-amber-200 disabled:opacity-50 transition"
                          >
                            {member.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
