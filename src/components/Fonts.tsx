import { Global } from "@emotion/react";

const Fonts = () => (
    <Global
        styles={`
            @font-face {
                font-family: "Kufam";
                src: url("/Kufam-Regular.ttf") format("truetype");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Kufam";
                src: url("/Kufam-SemiBold.ttf") format("truetype");
                font-weight: 600;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Kufam";
                src: url("/Kufam-ExtraBold.ttf") format("truetype");
                font-weight: 800;
                font-style: normal;
                font-display: swap;
            }
        `}
    />
);

export default Fonts;
