"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  async function submitForm() {
    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })
      if (error) {
        toast.add({
          title: "Error signing in",
          description: error.message || "An unknown error occurred.",
          type: "error",
        })
      } else {
        router.replace("/dashboard"); 
      }

    } catch (error) {
      console.log(error)
      toast.add({
        title: "Error signing in",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        type: "error",
      })
    } finally {
      setSubmitting(false);
    }
  }
  return <>
    <h2 className="text-sm font-medium opacity-50 fixed bottom-6 left-1/2 transform -translate-x-1/2">Made by Unified CDN</h2>
    <form onSubmit={(e)=> {
        e.preventDefault();
        submitForm();
    }} className="w-full max-w-100 absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Card className="">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e)=> setEmail(e.target.value)} required/>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input name="password" id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} required/>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <Spinner/> : "Sign In"}
            </Button>
            <Link href="/auth/sign-up" className="w-full">
              <Button disabled={submitting} type="button" size="xs" variant="link" className="w-full text-xs mt-0 text-muted-foreground hover:text-foreground">
                Sign Up
              </Button>
            </Link>
          </CardFooter>
      </Card>
    </form>
  </>
}
