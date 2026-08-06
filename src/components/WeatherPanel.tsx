import { useEffect, useState } from 'react';
import { REGION_POINTS } from '../services/mockData';
import { fetchWeatherAt } from '../services/api';
export default function WeatherPanel(){ const [rows,setRows]=useState<string[]>([]); useEffect(()=>{REGION_POINTS.forEach((p,i)=>fetchWeatherAt(p.lat,p.lon).then(t=>setRows(r=>{const n=[...r]; n[i]=t; return n;})))},[]); return <aside className="panel floating-panel weather"><div className="title">Clima por sector</div>{REGION_POINTS.map((p,i)=><div className="weather-item" key={p.name}><b>{p.name}</b><span>{rows[i]||'cargando...'}</span></div>)}</aside> }
