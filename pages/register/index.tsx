import LayoutRegular from "../../components/layoutRegular";
import NavbarLoggedOut from "../../components/navbarLoggedOut";
import styles from "../../styles/register-login.module.scss";
import indexStyles from "../../styles/index.module.scss";
import Link from "next/link";
import Head from "next/head";
import React, { FormEvent, ReactElement, useEffect, useState } from "react";
import { Eye, EyeClosed } from "phosphor-react";
import axios from "axios";
import Router from "next/router";
import Loading from "../../components/loading";
import { useToastContext } from "../../src/contexts/toastContext";

export default function Register(): ReactElement {
    const toast = useToastContext();

    const [loading, setLoading] = useState(true);
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const [registerAllowed, setRegisterAllowed] = useState(true);

    useEffect(() => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/users/validateToken`,
                { withCredentials: true }
            )
            .then((res) => {
                if (res.data.user) {
                    Router.push("/home");
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (registerAllowed) {
            setRegisterAllowed(false);
            if (validateForm()) {
                const formdata = new FormData();
                formdata.append("username", form.username);
                formdata.append("email", form.email);
                formdata.append("password", form.password);
                formdata.append("confirm_password", form.confirm_password);
                axios
                    .post(
                        `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/v1/users/create`,
                        formdata,
                        { withCredentials: true }
                    )
                    .then(() => {
                        toast("Successfully created new account", 5000);
                        Router.push("/register/setting-up");
                    })
                    .catch((err) => {
                        setRegisterAllowed(true);
                        toast(err?.response?.data?.message ?? "An error has occurred", 5000);
                    });
            }
        }
    };

    const validateForm = (): boolean => {
        if (
            !form.username ||
            !form.email ||
            !form.password ||
            !form.confirm_password
        ) {
            toast("All fields must be set", 4000);
            setRegisterAllowed(true);
            return false;
        }

        if (form.username.length < 3) {
            toast("Username cannot be shorted than 3 characters", 4000);
            setRegisterAllowed(true);
            return false;
        }

        if (form.username.length > 16) {
            toast("Username cannot be longer than 16 characters", 4000);
            setRegisterAllowed(true);
            return false;
        }

        if (form.password.length < 8) {
            toast("Password is too short", 4000);
            setRegisterAllowed(true);
            return false;
        }

        if (form.password !== form.confirm_password) {
            toast("Passwords don't match", 4000);
            setRegisterAllowed(true);
            return false;
        }
        return true;
    };

    return !loading ? (
        <>
            <Head>
                <title>Create an account - Twatter</title>
                {/* TODO: write meta tags and other important head tags */}
            </Head>
            <NavbarLoggedOut></NavbarLoggedOut>
            <LayoutRegular>
                <div className="text-white text-bold text-center my-3">
                    <p className="text-extra-large">Register</p>
                </div>
                <div className="flex justify-content-center">
                    <form
                        className="flex flex-column justify-content-center max-w-100"
                        onSubmit={handleSubmit}
                    >
                        <input
                            className={`text-medium text-thin ${styles.input}`}
                            type="text"
                            placeholder="Username"
                            name="username"
                            minLength={3}
                            maxLength={16}
                            autoComplete="off"
                            onChange={handleChange}
                        />
                        <input
                            className={`text-medium text-thin my-1 ${styles.input}`}
                            type="email"
                            placeholder="Email"
                            name="email"
                            autoComplete="off"
                            onChange={handleChange}
                        />
                        <div className="position-relative">
                            <input
                                id="password"
                                className={`text-medium text-thin max-w-100 ${styles.input}`}
                                type={passwordHidden ? "password" : "text"}
                                placeholder="Password"
                                name="password"
                                minLength={8}
                                autoComplete="off"
                                onChange={handleChange}
                            />
                            {passwordHidden ? (
                                <EyeClosed
                                    id="unhide"
                                    className={`${styles.icon}`}
                                    size="32"
                                    xlinkTitle="Unhide Password"
                                    onClick={() => setPasswordHidden(false)}
                                ></EyeClosed>
                            ) : (
                                <Eye
                                    id="hide"
                                    className={`${styles.icon}`}
                                    size="32"
                                    xlinkTitle="Hide Password"
                                    onClick={() => setPasswordHidden(true)}
                                ></Eye>
                            )}
                        </div>
                        <input
                            className={`text-medium text-thin my-1 ${styles.input}`}
                            type={passwordHidden ? "password" : "text"}
                            placeholder="Confirm Password"
                            name="confirm_password"
                            minLength={8}
                            autoComplete="off"
                            onChange={handleChange}
                        />
                        <button
                            className={`text-medium mt-1 mx-5Percent ${styles.button} ${indexStyles.filledButton}`}
                        >
                            Register a New Account
                        </button>
                        <p className="text-white text-right my-3Percent">
                            <Link href="/login">
                                <a>Already have an account? Log in</a>
                            </Link>
                        </p>
                    </form>
                </div>
            </LayoutRegular>
        </>
    ) : (
        <Loading height="100" width="100"></Loading>
    );
}
