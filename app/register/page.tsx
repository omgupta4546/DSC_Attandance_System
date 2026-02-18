'use client';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { registerUser } from '@/app/actions/user';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';

function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const eventNameParam = searchParams.get('event');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    universityRollNo: '',
    branch: '',
    year: '',
    phoneNumber: '',
    // Optional
    eventName: eventNameParam || '',
    githubProfile: '',
    linkedinProfile: '',
    portfolio: '',
    skills: '', // Comma separated
  });

  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate initial processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Exclude confirmPassword from the data sent to the server
    const { confirmPassword, ...dataToSubmit } = formData;
    const result = await registerUser(dataToSubmit);

    if (result.success) {
      toast({
        title: 'Registration Successful',
        description: 'Account created! Redirecting to login...',
      });
      // Delay to show success state
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/login');
    } else {
      toast({
        title: 'Registration Failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl border-primary/10 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-700">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary animate-bounce">
            <UserPlus className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl font-bold">Member Registration</CardTitle>
        <CardDescription className="text-center font-medium text-primary">
          Registration for {eventNameParam || 'Event'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <Input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="h-11 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="h-11 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="h-11 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
                className="h-11 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Input name="rollNumber" placeholder="Class Roll No" onChange={handleChange} required className="h-11 focus:ring-2 focus:ring-primary/20 transition-all" />
            <Input name="universityRollNo" placeholder="Univ Roll No" onChange={handleChange} className="h-11 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Input name="branch" placeholder="Branch" onChange={handleChange} className="h-11 focus:ring-2 focus:ring-primary/20 transition-all" />
            <Input name="year" placeholder="Year" onChange={handleChange} className="h-11 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <Input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="h-11 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          {/* Developer Profile */}
          <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <h3 className="text-sm font-semibold text-primary">Developer Profile (Optional)</h3>
            <Input name="githubProfile" placeholder="GitHub URL" onChange={handleChange} className="h-10 focus:ring-2 focus:ring-primary/20 transition-all" />
            <Input name="linkedinProfile" placeholder="LinkedIn URL" onChange={handleChange} className="h-10 focus:ring-2 focus:ring-primary/20 transition-all" />
            <Input name="portfolio" placeholder="Portfolio URL" onChange={handleChange} className="h-10 focus:ring-2 focus:ring-primary/20 transition-all" />
            <Input name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="h-10 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <Button type="submit" className="w-full h-12 text-lg mt-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-500">Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Login</Link></p>
      </CardFooter>
    </Card>
  );
}

export default function Register() {
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
        <Suspense fallback={<div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
          <RegisterForm />
        </Suspense>
      </main>

      <footer className="border-t py-6 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Developer Student Club. All rights reserved.
        </div>
      </footer>
    </div>
  );
}