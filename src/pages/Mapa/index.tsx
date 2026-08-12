import type { AppData, LayerKey } from '../../types';
import RouteCanvas from '../../components/RouteCanvas';
export default function Mapa({data,visible,setData,canEditWorks}:{data:AppData;visible:Record<LayerKey,boolean>;setData:(d:AppData)=>void;canEditWorks:boolean}){return <RouteCanvas data={data} visible={visible} setData={setData} canEditWorks={canEditWorks}/>}
