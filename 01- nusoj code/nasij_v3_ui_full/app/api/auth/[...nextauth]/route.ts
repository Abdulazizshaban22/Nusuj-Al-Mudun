
import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

export const authOptions:any = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: (process.env.KEYCLOAK_URL || "http://localhost:8081") + "/realms/" + (process.env.KEYCLOAK_REALM || "nasij")
    })
  ],
  callbacks: {
    async jwt({ token, account }){
      try{
        const at:any = account?.access_token
        if(at){
          const body = JSON.parse(Buffer.from(at.split('.')[1], 'base64').toString())
          const roles = body?.realm_access?.roles || []
          token.roles = roles
        }
      }catch{}
      return token
    },
    async session({ session, token }){
      (session as any).roles = (token as any).roles || []
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "please-change"
}
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
