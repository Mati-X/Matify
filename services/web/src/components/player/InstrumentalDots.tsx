export default function InstrumentalDots(props: { startTime: number, endTime: number, currentTime: number }) {

    const duration = Math.max(0.1,props.endTime - props.startTime);
    const progress  = (props.currentTime - props.startTime) / duration;


    return (
        <div className={'flex gap-3 py-2 items-center'}>
            {[0,1,2].map( (dotIndex) => {
                const start = dotIndex / 3;
                const end = (dotIndex + 1) / 3;
                const isLit = progress >= start && progress < end;

                const centers = [0.25, 0.5, 0.75];
                const radius = 0.22;

                const dist = Math.abs(progress - centers[dotIndex]);
                const intensity = Math.max(0, 1 - dist / radius);

                return(
                <div key={dotIndex} className={'size-5 bg-white rounded-full transition-all duration-500 ' +
                                (isLit ? ' scale-125 opacity-100 shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'bg-white/30 scale-90 opacity-40')}

                     style={{
                         opacity: 0.25 + intensity * 0.75,
                         transform: `scale(${0.85 + intensity * 0.4})`,
                         boxShadow: `0 0 ${Math.round(intensity * 18)}px rgba(255, 255, 255, ${intensity * 0.85})`,
                     }}/>
                )
            })}
        </div>
    )
}