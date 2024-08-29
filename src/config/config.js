import dotenv from "dotenv";

dotenv.config(
    {
        path:"./src/.env",
        override:true
    }
);

const config = { 
        PORT: process.env.PORT||8080,
        MONGO_URL: process.env.MONGO_URL,
        DB_NAME: process.env.DB_NAME,
        SECRET: process.env.SECRET,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        GMAIL_PASS: process.env.GMAIL_PASS
}

export default config;