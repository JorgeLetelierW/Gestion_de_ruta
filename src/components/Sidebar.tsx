import { NavLink } from 'react-router-dom';
const items=['Dashboard','Mapa','Trabajos','Clima','Rios','Usuarios','Configuracion'];
export default function Sidebar(){return <nav className="app-sidebar">{items.map(i=><NavLink key={i} to={`/${i.toLowerCase()}`} className={({isActive})=>`side-link ${isActive?'active':''}`}>{i}</NavLink>)}</nav>}
