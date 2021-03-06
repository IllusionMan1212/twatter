/* eslint-disable react/react-in-jsx-scope */
import styles from "./postOptionsContextMenu.module.scss";
import { Flag, Share, Eraser, Link } from "phosphor-react";
import axios from "../src/axios";
import { useToastContext } from "../src/contexts/toastContext";
import { PostOptionsMenuProps } from "../src/types/props";
import { ReactElement, useEffect, useRef, useState } from "react";
import { socket } from "src/hooks/useSocket";

export default function PostOptionsMenu(
    props: PostOptionsMenuProps
): ReactElement {
    const toast = useToastContext();

    const containerRef = useRef<HTMLDivElement>(null);

    const [top, setTop] = useState(-1);

    const handleOnClick = () => {
        if (props.postAuthorId != props.currentUserId) {
            return;
        }
        props.callback?.();
        const payload = {
            postAuthor: props.postAuthorId,
            postId: props.postId,
        };
        const socketPayload = {
            postId: props.postId,
        };
        axios
            .post("posts/deletePost", payload)
            .then((res) => {
                socket.emit("deletePost", socketPayload);
                toast(res.data.message, 3000);
            })
            .catch((err) => {
                toast(err?.response?.data?.message ?? "An error has occurred", 3000);
            });
    };

    useEffect(() => {
        if (props.topOffset >= 0) {
            const height = containerRef.current.getBoundingClientRect().height;
            if (props.topOffset < height) {
                setTop(props.topOffset - height);
            }
        }
    }, []);

    // TODO: look into useReducer

    return (
        <>
            <div ref={containerRef} className={`pointer ${styles.menu}`} style={{top: top != -1 ? top : "30px"}}>
                <div>
                    <Flag size="20"></Flag>
                    Report Post
                </div>
                <hr />
                <div
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/u/${props.postAuthorUsername}/${props.postId}`,
                                title: `${props.postAuthorUsername}'s post - Twatter`,
                            }).then(() => {
                                console.log("shared successfully");
                            }).catch(() => {
                                console.log("error while sharing");
                            });
                        } else {
                            // TODO: fallback share popup
                            console.log("cant share");
                        }
                    }}
                >
                    <Share size="20"></Share>
                    Share Post
                </div>
                <hr />
                <div
                    onClick={() => {
                        const link = `${process.env.NEXT_PUBLIC_DOMAIN_URL}/u/${props.postAuthorUsername}/${props.postId}`;
                        const tempInput = document.createElement("input");
                        tempInput.value = link;
                        tempInput.style.position = "fixed";
                        tempInput.style.top = "0";
                        document.body.appendChild(tempInput);
                        tempInput.focus();
                        tempInput.select();
                        tempInput.setSelectionRange(0, 99999);
                        try {
                            document.execCommand("copy");
                            toast("Copied Successfully", 3000);
                        } catch (err) {
                            toast("Error while copying link", 3000);
                        }
                        finally {
                            document.body.removeChild(tempInput);
                        }
                    }}
                >
                    <Link size="20"></Link>
                    Copy Link
                </div>
                {props.postAuthorId == props.currentUserId ? (
                    <>
                        <hr />
                        <div
                            className="dangerRed"
                            onClick={handleOnClick}
                        >
                            <Eraser size="20"></Eraser>
                        Delete Post
                        </div>
                    </>
                ) : null}
            </div>
            <div className="outsideClickOverlay"></div>
        </>
    );
}
