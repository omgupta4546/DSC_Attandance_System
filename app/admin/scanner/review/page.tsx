"use client";

import { useEffect, useState } from "react";
import { getAllRecruitments, review as reviewStudent, logout } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ScanLine, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  ScrollBar,
  ScrollArea
} from "@/components/ui/scroll-area";


interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  universityRollNo: string;
  year: string;
  eventName: string;
  phoneNumber: string;
  qrCode: string;
  attendance: any[];
  cgpa: string;
  back: string;
  summary: string;
  clubs: string;
  aim: string;
  believe: string;
  expect: string;
  domain: string[];
  review?: number;
  comment?: string;
  roundOneAttendance?: boolean;
  roundTwoAttendance?: boolean;
  roundOneQualified?: boolean;
  roundTwoQualified?: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentScreenshot?: string;
  referralCode?: string;
}

export default function AdminReviewPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();


  // filters
  const [branchFilter, setBranchFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [eventNameFilter, setEventNameFilter] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await getAllRecruitments();
    if (res.success) {
      setStudents(res.students ?? []);
    } else {
      toast({ variant: "destructive", title: "Error", description: res.error });
    }
    setLoading(false);
  };

  const handleUpdate = async (student: Student) => {
    const data = {
      studentId: student.id,
      review: student.review,
      comment: student.comment,
      roundOneAttendance: student.roundOneAttendance,
      roundTwoAttendance: student.roundTwoAttendance,
      roundOneQualified: student.roundOneQualified,
      roundTwoQualified: student.roundTwoQualified,
      paymentStatus: student.paymentStatus,
    };

    const res = await reviewStudent(data);

    if (res.success) {
      toast({ title: "Success", description: "Student updated successfully" });

      // ✅ Update only this student in state, don’t reset everything
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, ...data } : s))
      );
    } else {
      toast({ variant: "destructive", title: "Error", description: res.error });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast({ title: "Success", description: "Logged out successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Logout failed" });
    }
  };


  const handleInputChange = (id: string, field: string, value: any) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // filter students
  const filteredStudents = students.filter((s) => {
    return (
      (branchFilter ? s.branch === branchFilter : true) &&
      (domainFilter ? (s.domain || []).includes(domainFilter) : true) &&
      (eventNameFilter ? s.eventName === eventNameFilter : true)
    );
  });

  // collect unique values for dropdowns
  const uniqueBranches = Array.from(new Set(students.map((s) => s.branch))).filter(Boolean);
  const uniqueDomains = Array.from(
    new Set(students.flatMap((s) => s.domain || []))
  ).filter(Boolean);
  const uniqueEvents = Array.from(new Set(students.map((s) => s.eventName))).filter(Boolean);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end space-x-2">
        <Link href="/admin/scanner">
          <Button variant="outline" size="sm">
            <ScanLine className="h-4 w-4 mr-2" />
            Go to Scanner
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Admin: Review Students</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Branch" />
          </SelectTrigger>
          <SelectContent>
            {uniqueBranches.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Domain" />
          </SelectTrigger>
          <SelectContent>
            {uniqueDomains.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setEventNameFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Event" />
          </SelectTrigger>
          <SelectContent>
            {uniqueEvents.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setBranchFilter("");
            setDomainFilter("");
            setEventNameFilter("");
          }}
        >
          Reset
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border bg-gray-500 min-w-[150px]">Name</th>
                <th className="px-2 py-1 border bg-gray-500">Action</th>
                <th className="px-2 py-1 border bg-gray-500">Roll Number</th>
                <th className="px-2 py-1 border bg-gray-500">Email</th>
                <th className="px-2 py-1 border bg-gray-500">Branch</th>
                <th className="px-2 py-1 border bg-gray-500">Referral Code</th>
                <th className="px-2 py-1 border bg-gray-500">Payment</th>
                <th className="px-2 py-1 border bg-gray-500">Domain</th>
                <th className="px-2 py-1 border bg-gray-500">Review (0-10)</th>
                <th className="px-2 py-1 border bg-gray-500">Comment</th>
                <th className="px-2 py-1 border bg-gray-500">Round 1 Attendance</th>
                <th className="px-2 py-1 border bg-gray-500">Round 2 Attendance</th>
                <th className="px-2 py-1 border bg-gray-500">Round 1 Qualified</th>
                <th className="px-2 py-1 border bg-gray-500">Round 2 Qualified</th>
                <th className="px-2 py-1 border bg-gray-500 text-xs">Payment Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="px-2 py-1 border" onClick={() => {
                    setSelectedStudent(student);
                    setOpen(true);
                  }}>{student.name}</td>
                  
                  <td className="px-2 py-1 border text-center">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs px-3"
                      onClick={() => handleUpdate(student)}
                    >
                      Save
                    </Button>
                  </td>

                  <td className="px-2 py-1 border" onClick={() => {
                    setSelectedStudent(student)
                    setOpen(true)
                  }}>{student.rollNumber}</td>
                  <td className="px-2 py-1 border" onClick={() => {
                    setSelectedStudent(student);
                    setOpen(true);
                  }}>{student.email}</td>
                  <td className="px-2 py-1 border">{student.branch}</td>
                  <td className="px-2 py-1 border">{student.referralCode || "-"}</td>
                  <td className="px-2 py-1 border text-center">
                    <Select 
                      value={student.paymentStatus || 'pending'} 
                      onValueChange={(val: any) => handleInputChange(student.id, "paymentStatus", val)}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1 border">
                    {(student.domain || []).join(", ")}
                  </td>

                  <td className="px-2 py-1 border">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={student.review ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange(
                          student.id,
                          "review",
                          value === "" ? "" : Number(value)
                        );
                      }}
                    />
                  </td>


                  <td className="px-2 py-1 border">
                    <Input
                      type="text"
                      value={student.comment ?? ""}
                      onChange={(e) =>
                        handleInputChange(student.id, "comment", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <Checkbox
                      checked={student.roundOneAttendance ?? false}
                      onCheckedChange={(checked) =>
                        handleInputChange(student.id, "roundOneAttendance", checked)
                      }
                    />
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <Checkbox
                      checked={student.roundTwoAttendance ?? false}
                      onCheckedChange={(checked) =>
                        handleInputChange(student.id, "roundTwoAttendance", checked)
                      }
                    />
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <Checkbox
                      checked={student.roundOneQualified ?? false}
                      onCheckedChange={(checked) =>
                        handleInputChange(student.id, "roundOneQualified", checked)
                      }
                    />
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <Checkbox
                      checked={student.roundTwoQualified ?? false}
                      onCheckedChange={(checked) =>
                        handleInputChange(student.id, "roundTwoQualified", checked)
                      }
                    />
                  </td>

                  <td className="px-2 py-1 border text-center">
                    {student.paymentScreenshot ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(student.paymentScreenshot, '_blank')}
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">No Proof</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-8 bg-gray-950 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] max-h-[85vh] overflow-y-auto custom-scrollbar w-full max-w-5xl">
          {selectedStudent && (
            <div className="space-y-8 text-gray-200">
              {/* Header Section with Name and Roll Number */}
              <div className="text-center">
                <h3 className="text-4xl font-extrabold tracking-tight text-white">{selectedStudent.name}</h3>
                <p className="text-lg text-gray-400 mt-2 font-medium">{selectedStudent.rollNumber}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Core Details */}
                <div className="p-6 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 space-y-4">
                  <h4 className="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-4">Core Information</h4>

                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">Branch:</span>
                      <span>{selectedStudent.branch}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">Year:</span>
                      <span>{selectedStudent.year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">University Roll No:</span>
                      <span>{selectedStudent.universityRollNo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">CGPA:</span>
                      <span className="font-bold text-green-400">{selectedStudent.cgpa}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">Backlogs:</span>
                      <span className="font-bold text-red-400">{selectedStudent.back}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">Email:</span>
                      <a href={`mailto:${selectedStudent.email}`} className="text-blue-400 hover:underline">{selectedStudent.email}</a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-50">Phone:</span>
                      <span>{selectedStudent.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Domains and Aspiration */}
                <div className="p-6 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 space-y-6">
                  <h4 className="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-4">Aspirations & Interests</h4>

                  <div>
                    <h5 className="text-md font-semibold text-gray-300 mb-2">Domains</h5>
                    <div className="flex flex-wrap gap-2">
                      {(selectedStudent.domain || []).map(d => (
                        <span key={d} className="px-4 py-1 text-sm font-medium bg-purple-900 text-purple-300 rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-gray-300 mb-2">Clubs</h5>
                    <p className="text-sm text-gray-400">{selectedStudent.clubs}</p>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-gray-300 mb-2">Aim</h5>
                    <p className="text-sm text-gray-400">{selectedStudent.aim}</p>
                  </div>

                  {selectedStudent.paymentScreenshot && (
                    <div className="pt-4 border-t border-gray-700">
                      <h5 className="text-md font-semibold text-gray-300 mb-2">Payment Proof</h5>
                      <div className="aspect-video relative rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                        <img 
                          src={selectedStudent.paymentScreenshot} 
                          alt="Payment Screenshot" 
                          className="object-contain w-full h-full cursor-pointer"
                          onClick={() => window.open(selectedStudent.paymentScreenshot, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Summary & Beliefs */}
              <div className="p-6 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 space-y-6">
                <h4 className="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-4">Why should we have you in PTP?</h4>
                <p className="text-gray-300 leading-relaxed">{selectedStudent.summary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                  <div>
                    <h5 className="text-md font-semibold text-gray-300 mb-2">What I Believe</h5>
                    <p className="text-gray-400">{selectedStudent.believe}</p>
                  </div>
                  <div>
                    <h5 className="text-md font-semibold text-gray-300 mb-2">What I Expect</h5>
                    <p className="text-gray-400">{selectedStudent.expect}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>



    </div>
  );








}




