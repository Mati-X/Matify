import {LogOut, Settings, User} from "lucide-react";
import {useUIStore} from "../../store/useUIStore.ts";
import {useAuthStore} from "../../store/useAuthStore.ts";

function SideBar() {
    const openSearch = useUIStore((s) => s.openSearch);
    const openTab = useUIStore((s) => s.openTab);
    const user = useAuthStore((s) => s.user);
    const openAuthModal = useAuthStore((s) => s.openAuthModal);
    const logout = useAuthStore((s) => s.logout);
    const requireAuth = useAuthStore((s) => s.requireAuth);

    return (
        <aside className="w-72 shrink-0 h-full bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-6 select-none">
            <div className={'flex flex-col gap-8'}>
                <div className={'text-2xl font-bold tracking-tight text-white'}>
                    Matify
                </div>
                <div className={'flex-col flex gap-4 text-base font-medium text-neutral-300'}>
                    <p
                        onClick={() => openTab({id: 'home', title: 'Home', type: 'home'})}
                        className={'cursor-pointer hover:text-white transition-colors'}
                    >
                        Home
                    </p>
                    <p onClick={openSearch} className={'cursor-pointer hover:text-white transition-colors'}>Search</p>
                    <p
                        onClick={() => requireAuth(() => openTab({id: 'favorites', title: 'Favorites', type: 'favorites'}))}
                        className={'cursor-pointer hover:text-white transition-colors'}
                    >
                        Favorites
                    </p>
                </div>
                <div className={'flex-col flex gap-4 text-base text-neutral-400'}>
                    {[1,2,3,4,5].map((_, index) => <p key={index} className={'cursor-pointer hover:text-white transition-colors'}>Playlist {index + 1}</p>)}
                </div>
            </div>
            <div className={'flex items-center justify-between text-base text-neutral-300'}>
                {user ? (
                    <div className={'flex items-center gap-3 min-w-0'}>
                        <button
                            type={'button'}
                            onClick={() => openTab({id: `user:${user.id}`, title: user.username, type: 'user', entityId: user.id})}
                            className={'flex items-center gap-2 truncate hover:text-white transition-colors cursor-pointer'}
                        >
                            <User className={'w-5 h-5 shrink-0'}/>
                            <span className={'truncate'}>{user.username}</span>
                        </button>
                        <button
                            type={'button'}
                            onClick={logout}
                            title={'Log out'}
                            className={'p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer'}
                        >
                            <LogOut className={'w-4 h-4'}/>
                        </button>
                    </div>
                ) : (
                    <button
                        type={'button'}
                        onClick={openAuthModal}
                        className={'px-4 py-1.5 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-transform cursor-pointer'}
                    >
                        Sign In
                    </button>
                )}
                <Settings
                    onClick={() => openTab({id: 'settings', title: 'Settings', type: 'settings'})}
                    className={'w-5 h-5 shrink-0 cursor-pointer hover:text-white transition-colors'}
                />
            </div>
        </aside>
    );
}

export default SideBar;