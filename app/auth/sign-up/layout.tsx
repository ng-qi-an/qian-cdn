import { redirect } from "next/navigation";

export default function SignupLayout({children}: {children: React.ReactNode}){
    if (process.env.NEXT_PUBLIC_SIGNUP_ENABLED !== "true") {
        return redirect("/auth/sign-in");
    } else {
        return children
    }
}