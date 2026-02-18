// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { GraduationCap } from 'lucide-react';

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <header className="border-b">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <GraduationCap className="h-6 w-6" />
//             <h1 className="text-xl font-bold">Placement Cell</h1>
//           </div>
//           {/* <nav className="flex space-x-4">
//             <Link href="/login">
//               <Button variant="outline">Admin Login</Button>
//             </Link>
//             <Link href="/register">
//               <Button>Register</Button>
//             </Link>
//           </nav> */}
//         </div>
//       </header>

//       <main className="flex-1 container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <section className="mb-12 text-center">
//             <h2 className="text-2xl md:text-4xl text-center font-bold mb-4">PTP || RTU-KOTA</h2>
//             <p className="text-muted-foreground text-lg mb-6">
//               Streamline attendance tracking for placement activities with our QR code system
//             </p>
//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <Link href="/student-register">
//                 <Button size="lg" className="w-full sm:w-auto">Student Registration</Button>
//               </Link>
//               <Link href="/login">
//                 <Button size="lg" className="w-full sm:w-auto">Admin Access</Button>
//               </Link>
//             </div>
//           </section>

//           <div className="grid md:grid-cols-1 gap-6">
//             {/* <Card>
//               <CardHeader>
//                 <CardTitle>Register</CardTitle>
//                 <CardDescription>Create your student profile</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <p>Register with your details to get your unique QR code for attendance tracking.</p>
//               </CardContent>
//               <CardFooter>
//                 <Link href="/register" className="w-full">
//                   <Button className="w-full">Register</Button>
//                 </Link>
//               </CardFooter>
//             </Card> */}



//             <Card>
//               <CardHeader>
//                 <CardTitle>Dashboard</CardTitle>
//                 <CardDescription>Track your presence</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <p>View your attendance records and history for placement activities.</p>
//               </CardContent>
//               <CardFooter>
//                 <Link href="/dashboard" className="w-full">
//                   <Button variant="outline" className="w-full">Dashboard</Button>
//                 </Link>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       </main>

//       <footer className="border-t py-6">
//         <div className="container mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col items-center">
//           <span>© {new Date().getFullYear()} Placement Cell. All rights reserved.</span>

//           <a className='text-sm'>Developed By Divyanshu Sharma</a>
//         </div>
//       </footer>
//     </div>
//   );
// }


"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {

  // const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* <GraduationCap className="h-6 w-6 text-primary" /> */}
            <img src="/RTU logo.png" alt="Logo" className="h-10 w-10 transition-transform hover:scale-110 duration-300" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Developer Student Club
            </h1>
          </div>
          <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <section className="text-center mb-16 space-y-6 max-w-3xl animate-in fade-in zoom-in duration-700">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-bounce">
            Welcome to the Community
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            DSC <span className="text-primary">RTU KOTA</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Building a community of developers to learn, share, and grow together.
            Join us to accelerate your tech journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Join Community <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1">
                Member Login
              </Button>
            </Link>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full px-4">
          {/* Member Dashboard */}
          <div className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center space-x-4 pb-2 relative z-10">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl">Member Dashboard</CardTitle>
                  <CardDescription>View your activities</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">
                  Track your participation in workshops, hackathons, and stay informed about upcoming events.
                  Get access to exclusive resources.
                </p>
              </CardContent>
              <CardFooter className="relative z-10 pt-4">
                <Link href="/student-dashboard" className="w-full">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    Access Dashboard
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Lead Dashboard */}
          <div className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center space-x-4 pb-2 relative z-10">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl">Lead Dashboard</CardTitle>
                  <CardDescription>Management tools</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">
                  Manage community events, track member participation, and organize activities efficiently.
                  For Team Leads and Admins.
                </p>
              </CardContent>
              <CardFooter className="relative z-10 pt-4">
                <Link href="/dashboard" className="w-full">
                  <Button variant="ghost" className="w-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                    Lead Access
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-background/50 backdrop-blur-sm py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col items-center space-y-4">
          <div className="flex space-x-4">
            {/* Social links placeholder */}
          </div>
          <p>© {new Date().getFullYear()} Developer Student Club. All rights reserved.</p>
          <p className="text-xs">Developed with ❤️ by DSC Team</p>
        </div>
      </footer>
    </div>
  );
}
