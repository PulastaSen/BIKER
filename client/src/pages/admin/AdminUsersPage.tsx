import { useState, useEffect } from 'react';
import { getUsers } from '../../utils/appStorage';
import type { User, UserRole } from '../../types/app';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const filtered = users.filter((u) => (roleFilter === 'ALL' ? true : u.role === roleFilter));

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>User Directory</h1>
          <p className="subtitle">View and manage all registered Riders, Helpers, and Administrators.</p>
        </div>
      </header>

      <div className="filter-bar">
        <button
          type="button"
          className={`filter-tab ${roleFilter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setRoleFilter('ALL')}
        >
          All Users ({users.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${roleFilter === 'RIDER' ? 'is-active' : ''}`}
          onClick={() => setRoleFilter('RIDER')}
        >
          Riders ({users.filter((u) => u.role === 'RIDER').length})
        </button>
        <button
          type="button"
          className={`filter-tab ${roleFilter === 'HELPER' ? 'is-active' : ''}`}
          onClick={() => setRoleFilter('HELPER')}
        >
          Helpers ({users.filter((u) => u.role === 'HELPER').length})
        </button>
        <button
          type="button"
          className={`filter-tab ${roleFilter === 'ADMIN' ? 'is-active' : ''}`}
          onClick={() => setRoleFilter('ADMIN')}
        >
          Admins ({users.filter((u) => u.role === 'ADMIN').length})
        </button>
      </div>

      <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td><code>{u.id}</code></td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td><span className="badge badge--neutral">{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
