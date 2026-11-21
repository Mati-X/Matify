import {ListMusic} from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

function QueueButton() {
    const isQueueOpen = useUIStore((s) => s.isQueueOpen);
    const toggleQueue = useUIStore((s) => s.toogleQueue);

    return (
        <button
            onClick={toggleQueue}
            className={`p-3 rounded-lg transition-colors cursor-pointer ${
                isQueueOpen ? "text-emerald-400 bg-neutral-800" : "text-neutral-400 hover:text-white"
            }`}
            title="Tekst utworu"
        >
            <ListMusic className="size-5" />
        </button>
    );
}

export default QueueButton;