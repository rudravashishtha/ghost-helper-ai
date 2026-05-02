import { SignUp } from "@clerk/nextjs";
import { AuthLeftPanel } from "@/components/auth/auth-left-panel";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex bg-base">
      <AuthLeftPanel />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <SignUp />
      </div>
    </div>
  );
}
