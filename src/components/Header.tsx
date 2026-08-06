import { useEffect, useState } from 'react';
const pad=(n:number)=>String(n).padStart(2,'0');
function now(){const d=new Date(); return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
export default function Header(){ const [t,setT]=useState(now()); useEffect(()=>{const id=setInterval(()=>setT(now()),1000); return()=>clearInterval(id)},[]); return <div className="top-bar panel"><div className="font-black tracking-wide text-center">{t}</div></div> }
