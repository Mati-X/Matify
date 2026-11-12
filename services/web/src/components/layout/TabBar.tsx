import {useState} from "react";
import {X} from "lucide-react";

function TabBar() {

    interface Tab {
        id: string;
        title: string;
        type: 'home' | 'search' | 'album' | 'favorites';
    }

    const [tabs, setTabs] = useState<Tab[]>([1,2,3,4,5,6,7,8,9].map((id) => ({id: id.toString(), title: `Playlist ${id}`, type: 'search'})));
    const [activeTabId, setActiveTabId] = useState('1');

    return (
        <nav className={'w-full h-full overflow-x-auto flex-nowrap'}>
             <ul className={'flex flex-row h-full'}>
                {tabs.map((tab) => (
                    <li
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`flex flex-row items-center justify-between px-4 h-full border-r border-neutral-800/80 shrink-0 min-w-[200px] max-w-[220px] cursor-pointer text-sm transition-colors ${
                            activeTabId === tab.id
                                ? "bg-neutral-900 text-white font-medium"
                                : "text-neutral-400 hover:bg-neutral-900/40 hover:text-neutral-200"
                        }`}
                    >
                        {tab.title}
                        <button onClick={(e) =>
                        {
                            e.stopPropagation();
                            setTabs(tabs.filter((t) => t.id !== tab.id))
                        }}>
                        <X className={'w-4 h-4'} />
                             </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default TabBar;