import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import theClientPromise from "../../../lib/mongodb";

export default NextAuth({
  adapter: MongoDBAdapter(theClientPromise),

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        theEmailOrUsername: { label: "Email or Username", type: "text" },
        thePassword: { label: "Password", type: "password" }
      },
      async authorize(theCredentials) {
        if (!theCredentials) return null;

        const theRes = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(theCredentials)
        });

        const theData = await theRes.json();

        if (theRes.ok && theData?.user) {
          return {
            theId: theData.user.id,
            theName: theData.user.username,
            theEmail: theData.user.email,
            theAccessToken: theData.token
          };
        }
        return null;
      }
    })
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token: theToken, user: theUser, account: theAccount }) {
      if (theAccount && theAccount.access_token) {
        theToken.theOauthAccessToken = theAccount.access_token;
        theToken.theProvider = theAccount.provider;
      }
      if (theUser && theUser.theAccessToken) {
        theToken.theApiAccessToken = theUser.theAccessToken;
      }
      return theToken;
    },

    async session({ session: theSession, token: theToken }) {
      if (theSession.user) {
        theSession.user.theId = theToken.sub;
        theSession.user.theProvider = theToken.theProvider;
        theSession.user.theApiAccessToken = theToken.theApiAccessToken;
        theSession.user.theOauthAccessToken = theToken.theOauthAccessToken;
      }
      return theSession;
    }
  }
});

