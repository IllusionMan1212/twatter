/* eslint-disable react/react-in-jsx-scope */
import axios from "../src/axios";
import Router from "next/router";
import { ReactElement, useEffect } from "react";
import { useToastContext } from "../src/contexts/toastContext";
import { UserContextMenuProps } from "../src/types/props";
import styles from "./userContextMenu.module.scss";
import { socket } from "../src/hooks/useSocket";
import { Gear, SignOut, UserCircle, Bug } from "phosphor-react";
import ProfileImage from "./post/profileImage";

export default function UserContextMenu(
    props: UserContextMenuProps
): ReactElement {
    const toast = useToastContext();

    const logout = () => {
        axios
            .delete("/users/logout")
            .then(() => {
                socket.close();
                Router.push("/login");
                toast("Logged out", 3000);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    useEffect(() => {
        if (props.open) {
            document.body.classList.add("overflow-hidden");
            document.body.classList.remove("overflow-unset");
        } else {
            document.body.classList.remove("overflow-hidden");
            document.body.classList.add("overflow-unset");
        }
    }, [props.open]);

    return (
        <div className={`${styles.menuContainer} ${props.open ? styles.menuOpen : null}`}>
            <div className={styles.menuOverlay}></div>
            <div
                className={`${styles.menu}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <ProfileImage
                        width={35}
                        height={35}
                        src={props.currentUser.profile_image}
                    />{" "}
                    {props.currentUser.display_name}
                </div>
                <div>
                    <div
                        className={styles.menuItem}
                        onClick={() =>
                            Router.push(`/u/${props.currentUser.username}`)
                        }
                    >
                        <UserCircle size={25}/>
                        <p>Profile</p>
                    </div>
                    <div
                        className={styles.menuItem}
                        onClick={() => window.location.href = "https://github.com/illusionman1212/twatter/issues"}
                    >
                        <Bug size={25}/>
                        <p>Report a bug</p>
                    </div>
                    <div
                        className={styles.menuItem}
                        onClick={() => 
                            Router.push("/settings")
                        }
                    >
                        <Gear size={25}/>
                        <p>Settings</p>
                    </div>
                    <div
                        className={styles.menuItem}
                        onClick={() => logout()}
                    >
                        <SignOut size={25}/>
                        <p>Logout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
