import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
export default function Layout(){return <><Sidebar/><Header/><main className="fixed inset-0"><Outlet/></main></>}
