import type { AppData, LayerKey } from '../../types';
import RouteCanvas from '../../components/RouteCanvas';
export default function Mapa({data,visible,setData}:{data:AppData;visible:Record<LayerKey,boolean>;setData:(d:AppData)=>void}){return <RouteCanvas data={data} visible={visible} setData={setData}/>}
