import { useEffect, useState} from "react";
import { useStdin, useStdout } from "ink";

const DEFAULT_MOUSE_EVENT = {
    button: 0,
    x: 0,
    y: 0,
    pressed: false
}
const parseMouseEvent = (data: string):ShellMouseEvent  => {
	const match = /\x1b\[<(\d+);(\d+);(\d+)([mM])/.exec(data);
	if (!match) return DEFAULT_MOUSE_EVENT;

	const [, btn, col, row, type] = match;
	return {
		button: parseInt(btn ?? '0'), // 0 = left click
		x: parseInt(col ?? '0'),
		y: parseInt(row ?? '0'),
		pressed: type === 'M',
	};
};
type ShellMouseEvent = {
    button: number;
    x: number;
    y: number;
    pressed: boolean;
} 

function useMouseEvent(){

        const { stdin, setRawMode } = useStdin();
        const {write} = useStdout()
        const [mouseEvent,setMouseEvent] = useState<ShellMouseEvent>(DEFAULT_MOUSE_EVENT);
        useEffect(()=>{
            if(!stdin) return;
            setRawMode(true);
            write('\x1b[?1000;1006;1015h')
            let buffer = "";

            function onData(chunk:Buffer){
                buffer += chunk.toString("utf8");
                if(buffer.includes('\x1b[<')){
                    // console.log(parseMouseEvent(buffer))
                    setMouseEvent(parseMouseEvent(buffer));                    
                    buffer = "";
                }
            }

            stdin.on('data', onData);

		return () => {
			stdin.off('data', onData);
			write('\x1b[?1000;1006;1015l'); // Disable mouse tracking
		};
        },[stdin])
    
        return mouseEvent;

}

export default useMouseEvent;