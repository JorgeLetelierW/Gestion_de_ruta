import { useState } from 'react';
export function useAuth(){ const [user,setUser]=useState<string|null>(()=>localStorage.getItem('jlw_user')); const login=(email:string)=>{localStorage.setItem('jlw_user',email); setUser(email)}; const logout=()=>{localStorage.removeItem('jlw_user'); setUser(null)}; return {user,login,logout,isAuthenticated:!!user}; }
