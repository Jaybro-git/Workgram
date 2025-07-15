import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  const token = await getToken({ req, secret });
  const pathname = req.nextUrl.pathname;

  // Define path categories
  const publicPaths = ["/", "/login", "/signup", "/about", "/contact"];
  const protectedPaths = ["/dashboard", "/profile", "/settings"];
  
  // Role-specific paths
  const recruiterPaths = [
    "/recruiter",
    "/post-job", 
    "/applicants",
    "/browse",
    "/manage-jobs"
  ];
  
  const candidatePaths = [
    "/candidate",
    "/applications",
    "/saved",
    "/job-search",
    "/my-profile"
  ];

  // Check path types
  const isPublicPage = publicPaths.includes(pathname);
  const isProtectedPage = protectedPaths.some(path => pathname.startsWith(path));
  const isRecruiterPage = recruiterPaths.some(path => pathname.startsWith(path));
  const isCandidatePage = candidatePaths.some(path => pathname.startsWith(path));

  // Redirect logged-in users from public pages to dashboard
  if (token && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect logged-out users from protected pages to login
  if (!token && (isProtectedPage || isRecruiterPage || isCandidatePage)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for authenticated users
  if (token) {
    const userRole = token.accountType;

    // Block candidates from accessing recruiter-only paths
    if (isRecruiterPage && userRole === "candidate") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Block recruiters from accessing candidate-only paths
    if (isCandidatePage && userRole === "recruiter") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Public paths
    "/",
    "/login", 
    "/signup",
    "/about",
    "/contact",
    
    // Protected paths
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    
    // Recruiter paths
    "/recruiter/:path*",
    "/post-job/:path*",
    "/applicants/:path*",
    "/browse/:path*",
    "/manage-jobs/:path*",
    
    // Candidate paths
    "/candidate/:path*",
    "/applications/:path*",
    "/saved/:path*",
    "/job-search/:path*",
    "/my-profile/:path*"
  ],
};
