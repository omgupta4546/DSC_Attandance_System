"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEvents } from "../actions/events";
import Script from "next/script";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GraduationCap, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerStudents } from "@/app/actions/user";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  branch: z
    .string()
    .min(2, { message: "Branch must be at least 2 characters" }),
  year: z.string().min(1, { message: "Year is required" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  eventName: z
    .string()
    .min(2, { message: "Event name must be at least 2 characters" }),
  universityRollNo: z.string().min(2, {
    message: "University roll number must be at least 2 characters",
  }),
  rollNumber: z
    .string()
    .min(3, { message: "Roll number must be at least 3 characters" }),

  // new ga
  //     cgpa: z.string().min(1, { message: "CGPA is required" }),
  //     back: z.string().min(1, { message: "Back count is required" }),
  //     summary: z.string().min(1, { message: "This field is required" }),
  //       clubs: z.string().min(1, { message: "Clubs field is required" }),

  //        aim: z.string().min(2, { message: "Aim is required" }),
  // believe: z.string().min(2, { message: "This field is required" }),
  // expect: z.string().min(2, { message: "This field is required" }),
  // // domain: z.array(z.string()).min(1, { message: "Select at least one domain" }),
  // domain: z
  // .array(z.string())
  // .min(1, { message: "Select at least one domain" })
  // .max(2, { message: "You can select up to 2 domains only" }),

  // new end 
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<any>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getEventData = async () => {
      const res = await getEvents();
      if (res) {
        setEvents(res);
      }
    };
    getEventData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNumber: "",
      universityRollNo: "",
      eventName: "",
      branch: "",
      year: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",

      //new gagan
      //    cgpa: "",           
      // back: "",           
      // summary: "", 
      //  clubs: "",

      //  aim: "",
      // believe: "",
      // expect: "",
      // domain: [],
      //new  end
    },
  });

  // 1. Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("registrationFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData && typeof parsedData === 'object') {
          Object.keys(parsedData).forEach((key) => {
            form.setValue(key as any, parsedData[key]);
          });
        }
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, [form]);

  // 2. Save to localStorage on change
  const watchAllFields = form.watch();
  useEffect(() => {
    localStorage.setItem("registrationFormData", JSON.stringify(watchAllFields));
  }, [watchAllFields]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setPendingValues(values);
    setShowPaymentModal(true);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  async function handlePaymentSubmit() {
    if (!pendingValues || !screenshot) {
      toast({
        variant: "destructive",
        title: "Screenshot Required",
        description: "Please upload the payment screenshot to proceed.",
      });
      return;
    }

    setPaymentProcessing(true);
    setUploading(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", screenshot);
      formData.append("upload_preset", "Om gupta"); // As per user image

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/dyev0synn/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();

      if (!uploadData.secure_url) {
        throw new Error("Upload failed. Please try again.");
      }

      // 2. Register Student with Screenshot URL
      const registrationData = {
        ...pendingValues,
        paymentStatus: "pending", // Admin will verify screenshot
        paymentScreenshot: uploadData.secure_url,
      };

      const result = await registerStudents(registrationData);

        if (result.success) {
          localStorage.removeItem("registrationFormData"); // Clear draft on success
          toast({
            title: "Registration submitted",
            description: "Your registration is pending verification. We will verify your payment screenshot soon.",
          });
        setShowPaymentModal(false);
        router.push(`/student-dashboard?userId=${result.userId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.error || "Something went wrong.",
        });
      }
    } catch (error: any) {
      console.error("Payment Submission Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setPaymentProcessing(false);
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/RTU logo.png" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold">Placement Cell</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">WEB TALK</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Register Yourself to get your QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Student Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="student@gmail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                        >
                          <option value="">Select Branch</option>
                          <option value="CSE">CSE</option>
                          <option value="ECE">ECE</option>
                          <option value="ME">ME</option>
                          <option value="CE">CE</option>
                          <option value="EE">EE</option>
                          <option value="IT">IT</option>
                          <option value="PCE">PCE</option>
                          <option value="PE">PE</option>
                          <option value="AE">AE</option>
                          <option value="EIC">EIC</option>
                          <option value="CHE">CHE</option>
                          <option value="P&I">P&I</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        {events.length > 0 ? (
                          <select
                            {...field}
                            className="w-full border border-input rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Select an event</option>
                            {events.map((event: any) => (
                              <option key={event._id} value={event.eventName}>
                                {event.eventName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            {...field}
                            className="w-full border border-input rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Select an event</option>

                            {/* <option value="Core Team Recruitment">
                                Core Team Recruitment
                              </option> */}
                            <option value="WEB TALK">
                              WEB TALK
                            </option>

                          </select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="universityRollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="22EUCCS033" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="22/285" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* <FormField
                  control={form.control}
                  name="cgpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cgpa </FormLabel>
                      <FormControl>
                        <Input placeholder="9.4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                       <FormField
                  control={form.control}
                  name="back"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Active Backlogs </FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why should we have you in PTP ?</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="clubs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel >Active in which Clubs? (Write NONE if not active in any )</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                

                <FormField
  control={form.control}
  name="domain"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Select your preferred domain(s)  [MAX:2]</FormLabel>
      <div className="grid grid-cols-2 gap-2">
        {["Management","Graphic Designer","Video Editing","Photography","Content Writer","HR HEAD","Web Developer(Next.js Preferred)"].map((domain) => (
          <label key={domain} className="flex items-center space-x-2">
            <input
              type="checkbox"
              value={domain}
              checked={field.value?.includes(domain)}
              onChange={(e) => {
                const currentValues = field.value || [];
                if (e.target.checked) {
                  // Allow adding only if less than 2 already selected
                  if (currentValues.length < 2) {
                    field.onChange([...currentValues, domain]);
                  }
                } else {
                  // Remove if unchecked
                  field.onChange(currentValues.filter((d) => d !== domain));
                }
              }}
            />
            <span>{domain}</span>
          </label>
        ))}
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

  
               <FormField
                  control={form.control}
                  name="aim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your aim ?</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="believe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you believe joining the PTP will lead to placement opportunity?</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="expect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you expect from PTP?</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
 */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link
                href="/student-dashboard"
                className="text-primary underline underline-offset-4"
              >
                Go to Dashboard
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      {/* <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg md:max-w-xl lg:max-w-2xl text-center">
          <h1 className="text-xl font-bold">Oop's, It's too Late!!</h1>
          <h3 className="text-lg font-semibold">Registration Closed</h3>
        </Card>

                 </main> */}

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Payment (₹40)</DialogTitle>
            <DialogDescription>
              Scan the QR code to pay ₹40 and upload the screenshot below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <div className="p-2 border-2 border-primary/20 rounded-lg">
              {/* Replace PA with your actual UPI ID */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=omgupta@oksbi&pn=Placement%20Cell&am=40&cu=INR`} 
                alt="UPI QR Code" 
                className="w-48 h-48"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-primary">UPI ID: omgupta@oksbi</p>
              <p className="text-xs text-muted-foreground">Please pay exactly ₹40.00</p>
            </div>
            
            <div className="w-full space-y-2">
              <label className="text-sm font-medium">Upload Payment Screenshot</label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              disabled={paymentProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePaymentSubmit}
              disabled={paymentProcessing || !screenshot}
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading Screenshot..." : "Submitting..."}
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground flex-col flex items-center">
          <span>
            © {new Date().getFullYear()} Placement Cell. All rights reserved.
          </span>
          <span className="text-sm">Developed By Placement Team</span>
        </div>
      </footer>
    </div>
  );
}
