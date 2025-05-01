"use client";
import { InterviewProvider } from '@/app/context/InterviewContext';

export default function DashboardLayout({ children }) {
  return (
    <InterviewProvider>
      {children}
    </InterviewProvider>
  );
}