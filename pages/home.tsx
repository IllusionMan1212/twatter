/* eslint-disable react/react-in-jsx-scope */
import StatusBar from "../components/statusBar";
import Head from "next/head";
import { useUser } from "../src/hooks/useUser";
import Loading from "../components/loading";
import Navbar from "../components/navbar";
import styles from "../styles/home.module.scss";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import {
    ArrowElbowRightDown,
    ImageSquare,
    PaperPlaneRight,
    PenNibStraight,
    X,
} from "phosphor-react";
import Post from "../components/post/post";
import axiosInstance from "../src/axios";
import { useToastContext } from "../src/contexts/toastContext";
import MediaModal from "../components/mediaModal/mediaModal";
import { IAttachment, IPost, IUser } from "src/types/general";
import {
    handleChange,
    handleInput,
    handleKeyDown,
    handlePaste,
    handlePreviewImageClose,
    handleTextInput,
} from "src/utils/eventHandlers";
import { postCharLimit } from "src/utils/variables";
import axios from "axios";
import { LikePayload } from "src/types/utils";
import { socket } from "src/hooks/useSocket";
import { Virtuoso } from "react-virtuoso";

export default function Home(): ReactElement {
    const user = useUser("/login", null);

    const composePostRef = useRef<HTMLSpanElement>(null);
    const composePostButtonMobileRef = useRef<HTMLDivElement>(null);
    const inputContainerMobileRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef(null);

    const toast = useToastContext();

    const [postingAllowed, setPostingAllowed] = useState(false);
    const [charsLeft, setCharsLeft] = useState(postCharLimit);
    const [mobileCompose, setMobileCompose] = useState(false);
    const [posts, setPosts] = useState<Array<IPost>>([]);
    const [attachments, setAttachments] = useState<Array<IAttachment>>([]);
    const [previewImages, setPreviewImages] = useState<Array<string>>([]);
    const [nowPosting, setNowPosting] = useState(false);
    const [mediaModal, setMediaModal] = useState(false);
    const [modalData, setModalData] = useState({
        post: null as IPost,
        imageIndex: 0,
        currentUser: null as IUser,
    });
    const [touchY, setTouchY] = useState(null);
    const [reachedEnd, setReachedEnd] = useState(false);
    const [page, setPage] = useState(0);

    pageRef.current = page;

    const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (!postingAllowed) {
            e.preventDefault();
            return;
        }
        if (composePostRef.current.textContent.trim().length > postCharLimit) {
            e.preventDefault();
            return;
        }
        if (
            composePostRef.current.textContent.length == 0 &&
            attachments.length == 0
        ) {
            e.preventDefault();
            return;
        }
        setNowPosting(true);
        const content = composePostRef.current.innerText
            .replace(/(\n){2,}/g, "\n\n")
            .trim();
        const payload = {
            content: content,
            contentLength: composePostRef.current.textContent.length,
            author: user,
            attachments: attachments,
        };
        composePostRef.current.textContent = "";
        setAttachments([]);
        setPreviewImages([]);
        setPostingAllowed(false);
        setCharsLeft(postCharLimit);
        socket?.emit("post", payload);
    };

    const handleMediaClick = (
        _e: React.MouseEvent<HTMLElement, MouseEvent>,
        post: IPost,
        index: number
    ) => {
        setModalData({
            post: post,
            imageIndex: index,
            currentUser: user,
        });
        setMediaModal(true);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchY(e.targetTouches[0]?.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
        if (
            window.innerWidth <= 800 &&
            e.targetTouches[0]?.clientY - touchY > 0
        ) {
            e.currentTarget.style.transform = `translate(0, ${
                e.targetTouches[0]?.clientY - touchY
            }px)`;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        inputContainerMobileRef.current.style.transitionDuration = "300ms";

        if (e.changedTouches[0]?.clientY > touchY + 200) {
            closeMobileComposeSmoothly();
        } else if (mobileCompose) {
            inputContainerMobileRef.current.style.transform = "translate(0, 0)";
            setTimeout(() => {
                inputContainerMobileRef.current.style.transitionDuration =
                    "0ms";
            }, 300);
        }
    };

    const closeMobileComposeSmoothly = () => {
        inputContainerMobileRef.current.style.transform = `translate(0, ${window.innerHeight}px)`;
        setTimeout(() => {
            inputContainerMobileRef.current.style.transform = "translate(0, 0)";
            inputContainerMobileRef.current.style.transitionDuration = "0ms";
            setMobileCompose(false);
        }, 300);
    };

    const handlePost = useCallback(
        (post) => {
            toast("Posted Successfully", 3000);
            setNowPosting(false);
            setMobileCompose(false);

            setPosts([post].concat(posts));
        },
        [posts]
    );

    const handleDeletePost = useCallback(
        (postId) => {
            if (
                posts.some((post) => {
                    return post._id == postId;
                })
            ) {
                setPosts(posts?.filter((post) => post._id != postId));
            } else {
                setPosts(
                    posts.map((post) => {
                        post.comments.map((comment) => {
                            if (comment == postId) {
                                post.numberOfComments--;
                                return comment;
                            }
                            return comment;
                        });
                        return post;
                    })
                );
            }
        },
        [posts]
    );

    // this is for the mediamodal
    const handleComment = useCallback(
        (comment) => {
            setPosts(
                posts.map((post) => {
                    if (post._id == comment.replyingTo) {
                        console.log(comment);
                        post.comments.push(comment._id);
                        post.numberOfComments++;
                        return post;
                    }
                    return post;
                })
            );
        },
        [posts]
    );

    const handleLike = useCallback(
        (payload: LikePayload) => {
            setPosts(
                posts.map((post) => {
                    if (post._id == payload.postId) {
                        if (payload.likeType == "LIKE") {
                            post.likeUsers = post.likeUsers.concat(user._id);
                        } else if (payload.likeType == "UNLIKE") {
                            post.likeUsers = post.likeUsers.filter(
                                (_user) => _user != user._id
                            );
                        }
                        return post;
                    }
                    return post;
                })
            );
        },
        [posts, user?._id]
    );

    const getPosts = (): Promise<any> => {
        const cancelToken = axios.CancelToken;
        const tokenSource = cancelToken.source();
        return axiosInstance
            .get(`posts/getPosts/${pageRef.current}`, {
                cancelToken: tokenSource.token,
            })
            .then((res) => {
                return res.data.posts;
            })
            .catch((err) => {
                if (axios.isCancel(err)) {
                    console.log("Request canceled");
                    tokenSource.cancel();
                } else {
                    console.error(err);
                }
            });
    };

    const loadMorePosts = () => {
        setPage(pageRef.current + 1);
        getPosts().then((newPosts) => {
            if (!newPosts.length) {
                setReachedEnd(true);
                return;
            }
            setPosts(posts.concat(newPosts));
        });
    };

    useEffect(() => {
        if (socket?.connected) {
            socket.on("post", handlePost);
            socket.on("deletePost", handleDeletePost);
            socket.on("commentToClient", handleComment);
            socket.on("likeToClient", handleLike);
        }

        return () => {
            if (socket?.connected) {
                socket.off("post", handlePost);
                socket.off("deletePost", handleDeletePost);
                socket.off("commentToClient", handleComment);
                socket.off("likeToClient", handleLike);
            }
        };
    }, [handlePost, handleDeletePost, handleComment, handleLike]);

    useEffect(() => {
        getPosts().then((posts) => {
            if (posts?.length < 50) {
                setReachedEnd(true);
            }
            setPosts(posts);
        });
    }, []);

    useEffect(() => {
        if (composePostRef?.current) {
            composePostRef.current.addEventListener(
                "textInput",
                handleTextInput as never
            );
        }

        // on browser back button press, close the media modal
        window.onpopstate = () => {
            setMediaModal(false);
        };

        return () => {
            if (composePostRef?.current) {
                composePostRef.current.removeEventListener(
                    "textInput",
                    handleTextInput as never
                );
            }
        };
    });

    useEffect(() => {
        if (mobileCompose || mediaModal) {
            document.body.classList.add("overflow-hidden");
            document.body.classList.remove("overflow-unset");
        } else {
            document.body.classList.remove("overflow-hidden");
            document.body.classList.add("overflow-unset");
        }
    }, [mobileCompose, mediaModal]);

    return (
        <>
            <Head>
                <title>Home - Twatter</title>
            </Head>
            {user && user.finished_setup ? (
                <>
                    <Navbar
                        user={user}
                    ></Navbar>
                    <div>
                        <StatusBar title="Home" user={user}></StatusBar>
                        <div className={styles.content}>
                            <div className={styles.leftSide}>
                                friends
                            </div>
                            <div className={styles.center}>
                                <div
                                    className={
                                        mobileCompose
                                            ? styles.inputContainer
                                            : ""
                                    }
                                >
                                    <div
                                        className={styles.inputContainerMobile}
                                        ref={inputContainerMobileRef}
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        {/* 75px is the height of the navbar on mobile */}
                                        <div
                                            style={{
                                                minHeight: "calc(50% - 75px)",
                                            }}
                                            onClick={() =>
                                                closeMobileComposeSmoothly()
                                            }
                                        ></div>
                                        <div
                                            className={`flex ${
                                                styles.composePost
                                            } ${
                                                mobileCompose
                                                    ? styles.composePostMobile
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                className={`${styles.postDivContainer}`}
                                            >
                                                <span
                                                    ref={composePostRef}
                                                    className={`${styles.composePostDiv}`}
                                                    contentEditable="true"
                                                    data-placeholder="What's on your mind?"
                                                    onInput={(e) =>
                                                        handleInput(
                                                            e,
                                                            postCharLimit,
                                                            attachments,
                                                            setPostingAllowed,
                                                            setCharsLeft
                                                        )
                                                    }
                                                    onPaste={(e) =>
                                                        handlePaste(
                                                            e,
                                                            postCharLimit,
                                                            charsLeft,
                                                            setCharsLeft,
                                                            setPostingAllowed,
                                                            previewImages,
                                                            setPreviewImages,
                                                            attachments,
                                                            setAttachments,
                                                            toast
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(
                                                            e,
                                                            composePostRef,
                                                            handleClick
                                                        )
                                                    }
                                                ></span>
                                                <div
                                                    className={`flex ${styles.composePostOptions}`}
                                                >
                                                    <div
                                                        className={`${styles.button}`}
                                                    >
                                                        <ImageSquare size="30"></ImageSquare>
                                                        <input
                                                            className={
                                                                styles.fileInput
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    e,
                                                                    attachments,
                                                                    setAttachments,
                                                                    previewImages,
                                                                    setPreviewImages,
                                                                    setPostingAllowed,
                                                                    toast
                                                                )
                                                            }
                                                            onClick={(e) => {
                                                                e.currentTarget.value = null;
                                                            }}
                                                            type="file"
                                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                            multiple
                                                        />
                                                    </div>
                                                    <button
                                                        className={
                                                            styles.button
                                                        }
                                                        disabled={
                                                            postingAllowed
                                                                ? false
                                                                : true
                                                        }
                                                        onClick={handleClick}
                                                    >
                                                        <ArrowElbowRightDown
                                                            size="30"
                                                            opacity={
                                                                postingAllowed
                                                                    ? "1"
                                                                    : "0.3"
                                                            }
                                                        ></ArrowElbowRightDown>
                                                    </button>
                                                </div>
                                            </div>
                                            {previewImages.length != 0 && (
                                                <div
                                                    className={
                                                        styles.attachmentsPreview
                                                    }
                                                >
                                                    {previewImages.map(
                                                        (_attachment, i) => {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={
                                                                        styles.imageAttachment
                                                                    }
                                                                    style={{
                                                                        backgroundImage: `url('${previewImages[i]}')`,
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={`${styles.imageAttachmentOverlay}`}
                                                                    ></div>
                                                                    <div
                                                                        className={`${styles.imageAttachmentClose}`}
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            handlePreviewImageClose(
                                                                                e,
                                                                                i,
                                                                                previewImages,
                                                                                setPreviewImages,
                                                                                attachments,
                                                                                setAttachments,
                                                                                composePostRef,
                                                                                setPostingAllowed
                                                                            )
                                                                        }
                                                                    >
                                                                        <X
                                                                            size="16"
                                                                            weight="bold"
                                                                        ></X>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                className={`${
                                                    styles.charLimit
                                                } ${
                                                    charsLeft < 0
                                                        ? styles.charLimitReached
                                                        : ""
                                                }`}
                                                style={{
                                                    width: `${
                                                        ((postCharLimit -
                                                            charsLeft) *
                                                            100) /
                                                        postCharLimit
                                                    }%`,
                                                }}
                                            ></div>
                                            <div
                                                className={`${
                                                    styles.progressBar
                                                } ${
                                                    nowPosting
                                                        ? styles.progressBarInProgress
                                                        : ""
                                                }`}
                                            ></div>
                                        </div>
                                        {mobileCompose ? (
                                            <div
                                                className={
                                                    styles.composePostButtonsMobile
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.buttonMobile
                                                    }
                                                >
                                                    <ImageSquare size="36"></ImageSquare>
                                                    <input
                                                        className={
                                                            styles.fileInputMobile
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                attachments,
                                                                setAttachments,
                                                                previewImages,
                                                                setPreviewImages,
                                                                setPostingAllowed,
                                                                toast
                                                            )
                                                        }
                                                        onClick={(e) =>
                                                            (e.currentTarget.value = null)
                                                        }
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                        multiple
                                                    />
                                                </div>
                                                <button
                                                    className={
                                                        styles.buttonMobile
                                                    }
                                                    disabled={
                                                        postingAllowed
                                                            ? false
                                                            : true
                                                    }
                                                    onClick={handleClick}
                                                >
                                                    <PaperPlaneRight
                                                        size="36"
                                                        opacity={
                                                            postingAllowed
                                                                ? "1"
                                                                : "0.3"
                                                        }
                                                    ></PaperPlaneRight>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className={`text-white ${styles.posts}`}>
                                    <Virtuoso
                                        totalCount={posts.length}
                                        data={posts}
                                        endReached={loadMorePosts}
                                        useWindowScroll
                                        overscan={{ main: 500, reverse: 500 }}
                                        components={{
                                            // eslint-disable-next-line react/display-name
                                            Footer: () => {
                                                return (
                                                    <>
                                                        {!reachedEnd && (
                                                            <div
                                                                className={
                                                                    styles.loadingContainer
                                                                }
                                                            >
                                                                <Loading
                                                                    height="50"
                                                                    width="50"
                                                                ></Loading>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            },
                                        }}
                                        itemContent={(_index, post) => (
                                            <Post
                                                key={post._id}
                                                post={post}
                                                currentUser={user}
                                                handleMediaClick={handleMediaClick}
                                            ></Post>
                                        )}
                                    ></Virtuoso>
                                </div>
                            </div>
                            <div className={styles.rightSide}>
                                trending
                            </div>
                        </div>
                    </div>
                    <div
                        ref={composePostButtonMobileRef}
                        className={`text-white flex justify-content-center align-items-center ${
                            mobileCompose
                                ? styles.composePostMobileButtonActive
                                : ""
                        } ${styles.composePostMobileButton}`}
                        onClick={() => {
                            setMobileCompose(!mobileCompose);
                        }}
                    >
                        <PenNibStraight size="30"></PenNibStraight>
                    </div>
                    {mediaModal && (
                        <MediaModal
                            modalData={modalData}
                            handleMediaClick={handleMediaClick}
                        ></MediaModal>
                    )}
                </>
            ) : (
                <>
                    <Loading height="100" width="100"></Loading>
                </>
            )}
        </>
    );
}
