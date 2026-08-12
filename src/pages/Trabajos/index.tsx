import LogPanel from '../../components/LogPanel';
import type { Trabajo } from '../../types';
export default function Trabajos({works}:{works:Trabajo[]}){return <LogPanel works={works}/>}
