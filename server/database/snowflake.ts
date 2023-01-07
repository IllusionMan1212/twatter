import { Snowflake } from "nodejs-snowflake";

export const snowflake = new Snowflake({ custom_epoch: new Date("2022-07-01").getTime() });
