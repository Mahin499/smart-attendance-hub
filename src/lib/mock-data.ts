export interface Student {
  id: string;
  name: string;
  regNo: string;
  class: string;
  photoUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  period: number;
  status: "present" | "absent" | "sleepy" | "not-attentive";
  timestamp: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  username: string;
  department: string;
  joinedDate: string;
}

export interface PeriodConfig {
  period: number;
  startTime: string;
  endTime: string;
  isFree: boolean;
}

export const MOCK_STUDENTS: Student[] = [
  { id: "s1", name: "Arun Kumar", regNo: "CS2024001", class: "CSE-A" },
  { id: "s2", name: "Priya Sharma", regNo: "CS2024002", class: "CSE-A" },
  { id: "s3", name: "Rahul Verma", regNo: "CS2024003", class: "CSE-A" },
  { id: "s4", name: "Sneha Patel", regNo: "CS2024004", class: "CSE-B" },
  { id: "s5", name: "Vikram Singh", regNo: "CS2024005", class: "CSE-B" },
  { id: "s6", name: "Ananya Reddy", regNo: "EC2024001", class: "ECE-A" },
  { id: "s7", name: "Karthik Nair", regNo: "EC2024002", class: "ECE-A" },
  { id: "s8", name: "Meera Joshi", regNo: "ME2024001", class: "MECH-A" },
];

export const MOCK_FACULTY: FacultyMember[] = [
  { id: "f1", name: "Prof. James Wilson", username: "faculty1", department: "Computer Science", joinedDate: "2024-08-15" },
  { id: "f2", name: "Dr. Emily Chen", username: "faculty2", department: "Electronics", joinedDate: "2024-09-01" },
  { id: "f3", name: "Prof. Rajesh Kumar", username: "faculty3", department: "Mechanical", joinedDate: "2024-07-20" },
];

export const MOCK_PERIODS: PeriodConfig[] = [
  { period: 1, startTime: "09:00", endTime: "09:50", isFree: false },
  { period: 2, startTime: "09:50", endTime: "10:40", isFree: false },
  { period: 3, startTime: "10:50", endTime: "11:40", isFree: false },
  { period: 4, startTime: "11:40", endTime: "12:30", isFree: false },
  { period: 5, startTime: "13:30", endTime: "14:20", isFree: false },
  { period: 6, startTime: "14:20", endTime: "15:10", isFree: false },
  { period: 7, startTime: "15:20", endTime: "16:10", isFree: false },
  { period: 8, startTime: "16:10", endTime: "17:00", isFree: true },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: "a1", studentId: "s1", date: "2026-02-24", period: 1, status: "present", timestamp: "09:05:00" },
  { id: "a2", studentId: "s2", date: "2026-02-24", period: 1, status: "present", timestamp: "09:03:00" },
  { id: "a3", studentId: "s3", date: "2026-02-24", period: 1, status: "absent", timestamp: "09:50:00" },
  { id: "a4", studentId: "s4", date: "2026-02-24", period: 1, status: "sleepy", timestamp: "09:30:00" },
  { id: "a5", studentId: "s5", date: "2026-02-24", period: 1, status: "present", timestamp: "09:02:00" },
  { id: "a6", studentId: "s1", date: "2026-02-24", period: 2, status: "present", timestamp: "09:52:00" },
  { id: "a7", studentId: "s2", date: "2026-02-24", period: 2, status: "not-attentive", timestamp: "10:15:00" },
];

export function getAttendanceStats() {
  const total = MOCK_STUDENTS.length;
  const todayRecords = MOCK_ATTENDANCE.filter(a => a.date === "2026-02-24" && a.period === 1);
  const present = todayRecords.filter(a => a.status === "present").length;
  const absent = todayRecords.filter(a => a.status === "absent").length;
  const sleepy = todayRecords.filter(a => a.status === "sleepy").length;
  return { total, present, absent, sleepy, percentage: Math.round((present / total) * 100) };
}
