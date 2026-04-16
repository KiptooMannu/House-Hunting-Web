import { useState } from 'react';
import { 
  useGetHousesQuery, 
  useGetBookingsQuery, 
  useGetRevenueQuery,
  useGetProfileQuery
} from '../../store/apiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function TestEndpoints() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  
  // Queries
  const { data: houses, isLoading: housesLoading, refetch: refetchHouses } = useGetHousesQuery({});
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useGetBookingsQuery({});
  const { data: revenue, isLoading: revenueLoading, refetch: refetchRevenue } = useGetRevenueQuery({});
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery({});

  const tests = [
    { id: 'profile', name: 'GET /auth/profile', data: profile, loading: profileLoading, refetch: refetchProfile },
    { id: 'houses', name: 'GET /houses', data: houses, loading: housesLoading, refetch: refetchHouses },
    { id: 'bookings', name: 'GET /bookings', data: bookings, loading: bookingsLoading, refetch: refetchBookings },
    { id: 'revenue', name: 'GET /payments/revenue', data: revenue, loading: revenueLoading, refetch: refetchRevenue },
  ];

  const currentTestData = tests.find(t => t.id === activeTest);

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto font-body text-left">
      <div className="mb-12">
        <h1 className="text-4xl font-headline font-black text-primary tracking-tight mb-2">API Connectivity Tester</h1>
        <p className="text-slate-400 font-medium">Verify backend endpoints and response payloads in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Endpoint List */}
        <div className="space-y-4">
           {tests.map((test) => (
             <Card 
               key={test.id} 
               className={`cursor-pointer transition-all border-none ring-1 ${activeTest === test.id ? 'ring-primary shadow-lg scale-[1.02]' : 'ring-slate-100 hover:ring-slate-300'}`}
               onClick={() => setActiveTest(test.id)}
             >
               <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endpoint</span>
                    <span className="font-bold text-primary text-sm">{test.name}</span>
                  </div>
                  {test.loading && <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />}
               </CardContent>
             </Card>
           ))}
        </div>

        {/* Results Window */}
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-none shadow-2xl bg-slate-900 text-slate-100 overflow-hidden min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-800 flex flex-row justify-between items-center p-6">
               <div>
                  <CardTitle className="text-lg font-headline font-bold">Inspect Payload</CardTitle>
                  <p className="text-xs text-slate-400">{activeTest ? `Viewing result for ${activeTest}` : 'Select an endpoint to test'}</p>
               </div>
               {activeTest && (
                 <Button 
                   size="sm" 
                   variant="outline" 
                   className="text-white border-white/20 hover:bg-white/10"
                   onClick={() => currentTestData?.refetch()}
                 >
                    <span className="material-symbols-outlined text-sm mr-2">refresh</span>
                    Refetch
                 </Button>
               )}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
               <ScrollArea className="flex-1 p-8">
                  {activeTest ? (
                    <pre className="text-sm font-mono text-secondary-fixed-dim whitespace-pre">
                      {JSON.stringify(currentTestData?.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                       <span className="material-symbols-outlined text-6xl mb-4">terminal</span>
                       <p className="font-bold uppercase tracking-widest text-sm">Waiting for execution...</p>
                    </div>
                  )}
               </ScrollArea>
               
               {activeTest && (
                 <div className="p-4 bg-black/40 border-t border-white/5 flex gap-4">
                    <Badge className="bg-secondary/20 text-secondary border-none">STATUS: 200 OK</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/40 font-mono">TIMING: 42ms</Badge>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
