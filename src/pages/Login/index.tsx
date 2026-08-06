import { useState } from 'react';
export default function Login({login}:{login:(email:string)=>void}){const [email,setEmail]=useState('jletelier@intervialchile.cl'); return <div className="login"><div className="panel login-card"><h1>Gestión de Ruta JLW</h1><input value={email} onChange={e=>setEmail(e.target.value)} /><button onClick={()=>login(email)}>Ingresar</button></div></div>}
