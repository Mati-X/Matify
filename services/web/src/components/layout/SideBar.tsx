import {Cog} from "lucide-react";

function SideBar() {
    return (
        <aside className="w-80 shrink-0 h-full bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-5 select-none">
            <div className={'flex flex-col gap-8'}>
                <div className={''}>
                    Matify
                </div>
                <div className={'flex-col flex gap-5'}>
                    <p>Home</p>
                    <p>Szukaj</p>
                    <p>Ulubione</p>
                </div>
                <div className={'flex-col flex gap-5'}>
                    {[1,2,3,4,5].map((_, index) => <p key={index}>Playlist {index + 1}</p>)}
                </div>
            </div>
            <div className={'flex justify-between'}><p>Profile</p><Cog/></div>
        </aside>
    );
}

export default SideBar;