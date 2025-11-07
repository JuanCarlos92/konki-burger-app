"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Menu } from "lucide-react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/contexts/AppContext";
import { errorEmitter } from "@/firebase";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values.email, values.password);
      
      toast({
        title: "Logged In!",
        description: `Welcome back!`,
      });

      // The admin layout will handle redirection for admins.
      router.push("/");

    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
        });
      } else {
        const contextualError = new Error(`Login failed: ${error.message}`);
        errorEmitter.emit('permission-error', contextualError as any);
      }
    }
  };
  
  const handlePasswordReset = () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            toast({
                title: "Password Reset Email Sent",
                description: `An email has been sent to ${email} with instructions to reset your password.`,
            });
        })
        .catch((error) => {
            const contextualError = new Error(`Password reset failed: ${error.message}`);
            errorEmitter.emit('permission-error', contextualError as any);
        });
  };

  const handleGuest = () => {
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Link href="/" className="mb-4 inline-block">
                <Menu className="h-10 w-10 text-primary mx-auto" />
            </Link>
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs text-primary"
                        onClick={handlePasswordReset}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Log In
              </Button>
               <Button type="button" variant="secondary" className="w-full" onClick={handleGuest}>
                Continue as Guest
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
