import {Settings} from "lucide-react";
import {useUIStore} from "../../store/useUIStore.ts";

function SideBar() {
    const openSearch = useUIStore((s) => s.openSearch);
    return (
        <aside className="w-72 shrink-0 h-full bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-6 select-none">
            <div className={'flex flex-col gap-8'}>
                <div className={'text-2xl font-bold tracking-tight text-white'}>
                    Matify
                </div>
                <div className={'flex-col flex gap-4 text-base font-medium text-neutral-300'}>
                    <p className={'cursor-pointer hover:text-white transition-colors'}>Home</p>
                    <p onClick={openSearch} className={'cursor-pointer hover:text-white transition-colors'}>Search</p>
                    <p className={'cursor-pointer hover:text-white transition-colors'}>Favorites</p>
                </div>
                <div className={'flex-col flex gap-4 text-base text-neutral-400'}>
                    {[1,2,3,4,5].map((_, index) => <p key={index} className={'cursor-pointer hover:text-white transition-colors'}>Playlist {index + 1}</p>)}
                </div>
            </div>
            <div className={'flex items-center justify-between text-base text-neutral-300'}><p className={'cursor-pointer hover:text-white transition-colors'}>Profile</p><Settings className={'w-5 h-5 cursor-pointer hover:text-white transition-colors'}/></div>
        </aside>
    );
}

export default SideBar;