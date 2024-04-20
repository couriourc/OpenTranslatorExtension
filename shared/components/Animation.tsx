import {Player} from '@lottiefiles/react-lottie-player';
import PleaseWaitLottieJson from "@/assets/lottiefiles/please-wait.json?url";
import {useTheme} from "@/shared/hooks/useTheme.ts";
import {forwardRef, useEffect, useRef} from "react";
import {css} from "@emotion/css";

export const LoadingCoffee = forwardRef<Player>((props, ref) => {
    const {theme} = useTheme();
    return <Player
        autoplay
        loop
        src={PleaseWaitLottieJson}
        {...props}
        ref={ref}
        className={css`
            
        `}
    >
    </Player>;

});
