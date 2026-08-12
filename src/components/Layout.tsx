import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import type { UserRole } from '../types';
export default function Layout({ user, role, logout }: { user: string; role: UserRole; logout: () => void }){return <><Sidebar role={role}/><Header user={user} role={role} logout={logout}/><main className="fixed inset-0"><Outlet/></main></>}
