'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"; // Correct hook import
import { loginUser, getSession } from '@/app/actions/user';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
  email: z.string().min(1, { message: 'Email or Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        if (session.role === 'admin' || session.role === 'member') {
          router.replace('/admin/scanner');
        } else {
          router.replace(`/student-dashboard?userId=${session.userId}`);
        }
      }
    };
    checkSession();
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await loginUser({ email: values.email, password: values.password });

      if (result.success) {
        toast({
          title: "Login successful",
          description: "Redirecting to dashboard...",
        });

        // Add a small delay for user to see success state
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (result.role === 'admin' || result.role === 'member') {
          router.push('/admin/scanner');
        } else {
          router.push(`/student-dashboard?userId=${result.userId}`);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: result.error || "Invalid credentials.",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <img src="/RTU logo.png" alt="Logo" className="h-8 w-8 transition-transform hover:scale-110 duration-300" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Developer Student Club</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className='animate-in fade-in slide-in-from-top-4 duration-500 delay-100'>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-primary/10 animate-in fade-in zoom-in duration-500">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10 animate-bounce">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold">Member Login</CardTitle>
            <CardDescription className="text-center">
              Login to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-lg transition-all duration-300 hover:shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => signIn('google', { callbackUrl: '/api/auth/sync' })}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">Don't have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Register</Link></p>
          </CardFooter>
        </Card>
      </main>

      <footer className="border-t py-6 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Developer Student Club. All rights reserved.
        </div>
      </footer>
    </div>
  );
}