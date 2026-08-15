import { NavLink } from 'react-router-dom';

const items=[
'Dashboard',
'Carga',
'Infraestructura',
'Trabajos',
'Clima',
'Configuracion'
];

export default function Sidebar(){return <nav className="app-sidebar">{items.map(i=><NavLink key={i} to={`/${i.toLowerCase()}`} className={({isActive})=>`side-link ${isActive?'active':''}`}>{i}</NavLink>)}</nav>}
