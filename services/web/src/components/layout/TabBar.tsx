
import {Disc3, Guitar, Heart, Home, ListMusic, Settings, User, X} from "lucide-react";
import {useUIStore, type TabType} from "../../store/useUIStore.ts";
import type {LucideIcon} from "lucide-react/types";

function TabBar() {

    const TAB_ICONS: Record<TabType, LucideIcon> =
        {
            home: Home,
            album: Disc3,
            playlist: ListMusic,
            artist: Guitar,
            user: User,
            favorites: Heart,
            settings: Settings
        }

    const tabs = useUIStore((s) => s.tabs);
    const setActiveTab = useUIStore((s) => s.setActiveTab);
    const activeTabId = useUIStore((s) => s.activeTabId);
    const closeTab = useUIStore((s) => s.closeTab);
    return (
        <nav className="w-full h-10 shrink-0 border-b border-neutral-800/80 overflow-x-auto flex-nowrap">
             <ul className={'flex flex-row h-full'}>
                {tabs.map((tab) => {
                    const Icon = TAB_ICONS[tab.type];
                    return (
                        <li
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-row items-center justify-between px-4 h-full border-r border-neutral-800/80 shrink-0 min-w-[200px] max-w-[220px] cursor-pointer text-sm transition-colors ${
                                activeTabId === tab.id
                                    ? "bg-neutral-900 text-white font-medium"
                                    : "text-neutral-400 hover:bg-neutral-900/40 hover:text-neutral-200"
                            }`}
                        >
                            <div className={'flex flex-row items-center'}>
                                <Icon className={'w-4 h-4 mr-2'}/>
                                {tab.title}
                            </div>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                closeTab(tab.id)
                            }}>
                                <X className={'w-4 h-4'}/>
                            </button>
                        </li>)

                })}
            </ul>
        </nav>
    );
}

export default TabBar;