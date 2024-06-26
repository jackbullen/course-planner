import { animated, useSpring } from "@react-spring/web";
import { AnswerIcon } from "./AnswerIcon";

export const AnswerLoading = () => {
    const animatedStyles = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    });
    return (
        <animated.div style={{ ...animatedStyles }}>
            <div className="">
                <AnswerIcon />
                <div>
                    <p className="">
                        Generating answer
                        <span className="" />
                    </p>
                </div>
            </div>
        </animated.div>
    );
};