import { useEffect, useState } from 'react';
import type { UserAccount, UserRole } from '../../types';
import { createUser, deleteUser, listUsers, updateUser } from '../../services/usersDb';

const ROLES: UserRole[] = ['Administrador', 'Supervisor', 'Visor'];

export default function Usuarios() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Visor');
  const [newPassword, setNewPassword] = useState('');

  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Visor');
  const [editPassword, setEditPassword] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const rows = await listUsers();
      setUsers(rows);
      if (rows.length && !rows.some(item => item.username === editUsername)) {
        setEditUsername(rows[0].username);
        setEditRole(rows[0].role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const selected = users.find(item => item.username === editUsername);
    if (selected) setEditRole(selected.role);
  }, [editUsername, users]);

  const clearFeedback = () => {
    setError('');
    setMessage('');
  };

  const onCreate = async () => {
    clearFeedback();
    try {
      await createUser({ username: newUsername, role: newRole, password: newPassword });
      setMessage('Usuario creado');
      setNewUsername('');
      setNewPassword('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear usuario');
    }
  };

  const onUpdate = async () => {
    if (!editUsername) return;
    clearFeedback();
    try {
      await updateUser({ username: editUsername, role: editRole, password: editPassword || undefined });
      setMessage('Usuario actualizado');
      setEditPassword('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar usuario');
    }
  };

  const onDelete = async () => {
    if (!editUsername) return;
    clearFeedback();
    try {
      await deleteUser(editUsername);
      setMessage('Usuario eliminado');
      setEditPassword('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar usuario');
    }
  };

  return (
    <section className="page-card users-page">
      <h1>Usuarios</h1>
      <p>Base local de usuarios (IndexedDB). Solo Administrador puede modificar este módulo.</p>

      {message && <p className="users-message">{message}</p>}
      {error && <p className="users-error">{error}</p>}

      <div className="users-grid">
        <div className="users-list">
          <h2>Usuarios existentes</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <ul>
              {users.map(item => (
                <li key={item.username}>
                  <strong>{item.username}</strong> · {item.role}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="users-form">
          <h2>Crear usuario</h2>
          <input value={newUsername} placeholder="usuario" onChange={e => setNewUsername(e.target.value)} />
          <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}>
            {ROLES.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="password"
            value={newPassword}
            placeholder="contraseña (mín. 6)"
            onChange={e => setNewPassword(e.target.value)}
          />
          <button disabled={!newUsername.trim() || !newPassword} onClick={onCreate}>
            Crear
          </button>
        </div>

        <div className="users-form">
          <h2>Editar / eliminar</h2>
          <select value={editUsername} onChange={e => setEditUsername(e.target.value)}>
            <option value="">Seleccionar usuario</option>
            {users.map(item => (
              <option key={item.username} value={item.username}>
                {item.username}
              </option>
            ))}
          </select>
          <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)} disabled={!editUsername}>
            {ROLES.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="password"
            value={editPassword}
            placeholder="nueva contraseña (opcional)"
            onChange={e => setEditPassword(e.target.value)}
            disabled={!editUsername}
          />
          <div className="users-actions">
            <button disabled={!editUsername} onClick={onUpdate}>
              Guardar
            </button>
            <button className="danger" disabled={!editUsername} onClick={onDelete}>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
