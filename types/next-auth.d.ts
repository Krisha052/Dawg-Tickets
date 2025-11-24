import NextAuth from "next-auth";

export default NextAuth({
  callbacks: {
    async jwt({ token: theToken, user: theUser, account: theAccount }) {
      if (theAccount && theAccount.access_token) {
        theToken.oauthAccessToken = theAccount.access_token;
        theToken.provider = theAccount.provider;
      }
      if (theUser && theUser.accessToken) {
        theToken.apiAccessToken = theUser.accessToken;
      }
      return theToken;
    },

    async session({ session: theSession, token: theToken }) {
      if (theSession.user) {
        theSession.user.id = theToken.sub;
        theSession.user.provider = theToken.provider;
        theSession.user.apiAccessToken = theToken.apiAccessToken;
        theSession.user.oauthAccessToken = theToken.oauthAccessToken;
      }
      return theSession;
    }
  }
});
