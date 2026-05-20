
export { default } from "next-auth/middleware"
export const config = { matcher: ["/admin/:path*", "/studios/:path*", "/simulations/:path*"] }
