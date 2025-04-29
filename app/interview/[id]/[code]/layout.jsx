// layout.js
import { InterviewProvider } from '@/lib/context/InterviewContext';

export default function RootLayout({ children }) {
  return (
        <InterviewProvider>
          {children}
        </InterviewProvider>
  );
}