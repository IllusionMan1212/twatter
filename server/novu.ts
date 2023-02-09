import { Novu } from "@novu/node";

const novu = new Novu(process.env.NOVU_APIKEY ?? "");

export default novu;
