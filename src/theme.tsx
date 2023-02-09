import { ComponentStyleConfig, extendTheme, ThemeConfig } from "@chakra-ui/react";

const fonts = { body: "'Kufam', Sans" };

const config: ThemeConfig = {
    initialColorMode: "system",
    useSystemColorMode: true,
};

const breakpoints = {
    "600px": "37.5em",
    md: "52em",
    lg: "64em",
    xl: "80em",
};

const Button: ComponentStyleConfig = {
    variants: {
        outline: {
            border: "2px solid",
        },
    },
};

const MenuList: ComponentStyleConfig = {
    baseStyle: {
        background: "black",
        _dark: {
            background: "blue"
        }
    }
};

const MenuItem: ComponentStyleConfig = {
    baseStyle: {
        background: "var(--chakra-colors-bgSecondary)",
        _dark: {
            background: "var(--chakra-colors-bgThird)"
        }
    }
};

const Checkbox: ComponentStyleConfig = {
    baseStyle: {
        icon: {
            color: "white",
        },
        control: {
            bgColor: "textMain",
            rounded: "4px",
            borderColor: "transparent",
            _checked: {
                bgColor: "textMain",
                rounded: "4px",
                borderColor: "transparent",
                _hover: {
                    bgColor: "textMain",
                    borderColor: "transparent",
                }
            },
            _indeterminate: {
                bgColor: "textMain",
                rounded: "4px",
                borderColor: "transparent",
            },
            _disabled: {
                bgColor: "textMain",
                rounded: "4px",
                borderColor: "transparent",
                opacity: 0.5,
            },
        },
    }
};

const theme = extendTheme({
    config,
    styles: {
        global: {
            "*": {
                "::-webkit-scrollbar": {
                    width: "5px",
                    backgroundColor: "transparent"
                },
                WebkitTapHighlightColor: "transparent",
                "::-webkit-scrollbar-thumb": {
                    backgroundColor: "var(--chakra-colors-button-400)",
                    borderRadius: 9000,
                },
                scrollbarColor: "grey transparent",
            },
            "body": {
                backgroundColor: "bgMain"
            }
        }
    },
    components: {
        Button,
        Checkbox,
        MenuList,
        MenuItem,
    },
    semanticTokens: {
        colors: {
            text: {
                default: "#16161D",
                _dark: "#f3f3f6",
            },
            textOpposite: {
                default: "#f3f3f6",
                _dark: "#16161D",
            },
            textMain: {
                default: "#747474",
                _dark: "#909090",
            },
            textSecondary: {
                default: "#404040",
                _dark: "#7a7a7a",
            },
            bgMain: {
                default: "#E6EDF4",
                _dark: "#121314",
            },
            bgPrimary: {
                default: "#D9E1EA",
                _dark: "#1E1F22",
            },
            bgSecondary: {
                default: "#CBD2DA",
                _dark: "#16181B",
            },
            bgThird: {
                default: "#565960",
                _dark: "#565960",
            },
            stroke: {
                default: "#A0A0A0",
                _dark: "#464646",
            },
        },
        radii: {
            button: "8px",
        },
        headerHeight: {
            desktop: "61px",
            mobile: "56px",
        },
        navBarHeight: "49px",
        tableHeaderHeight: "40px",
    },
    colors: {
        button: {
            50: "#E6EDF4",
            100: "#CBD2DA",
            200: "#eaeaea",
            300: "#dadada",
            400: "#b7b7b7",
            500: "#1c1c1c",
            600: "#111111",
            700: "#0A0A0A",
            800: "#050505",
            900: "#000000"
        },
        navItem: {
            100: "#09090a",
            200: "#121314",
            300: "#2b2e30",
            400: "#3c3e44",
            500: "#E6EDF4",
            600: "#c5d3dc",
            700: "#a3b4c1",
            800: "#8096a7",
            900: "#678193"
        },
        conversationItem: {
            100: "#09090a",
            200: "#1E1F22",
            300: "#2b2c30",
            400: "#3c3e44",
            500: "#D9E1EA",
            600: "#d4dce4",
            700: "#ced6dd",
            800: "#c9d0d7",
            900: "#c4cad1"
        },
        notificationItem: {
            100: "#09090a",
            200: "#121314",
            300: "#2b2c30",
            400: "#3c3e44",
            500: "#E6EDF4",
            600: "#d4dce4",
            700: "#ced6dd",
            800: "#c9d0d7",
            900: "#c4cad1"
        },
        accent: {
            50: "#e6eefd",
            100: "#c5d5e7",
            200: "#a7b8ce",
            300: "#879cb6",
            400: "#6f86a3",
            500: "#577291",
            600: "#4A6480",
            700: "#3a5169",
            800: "#2c3f54",
            900: "#1a2a3c",
        },
        grey: {
            100: "#212529",
            200: "#343a40",
            300: "#495057",
            400: "#6c757d",
            500: "#C4CBD499",
            600: "#ced4da",
            700: "#dee2e6",
            800: "#e9ecef",
            900: "#f8f9fa",
        }
    },
    shadows: {
        header: "0 4px 4px rgba(0, 0, 0, 0.15)",
        conversationHeader: "0 2px 2px rgba(0, 0, 0, 0.07)",
        conversationFooter: "0 -2px 2px rgba(0, 0, 0, 0.07)",
        nav: "0 -2px 4px rgba(0, 0, 0, 0.15)",
    },
    radii: {
        compose: "8px",
    },
    fonts,
    breakpoints,
});

export default theme;
