import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ClerkProvider } from "@clerk/clerk-react";


// Use process.env for environment variables in CRA
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}



export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <header>
        <SignedOut>
            <SignInButton />
        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
        </header>
    </ClerkProvider>
  );
}