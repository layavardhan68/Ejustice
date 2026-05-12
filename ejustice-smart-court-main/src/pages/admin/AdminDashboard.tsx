import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/context/AuthContext';
import { Users, FileText, Shield, Activity, Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminVerifyUser, adminCreateJudge } from '@/services/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { users, cases, systemLogs, verifyUser: contextVerifyUser } = useAuth();
  const pendingVerification = users.filter(u => !u.verified && u.role !== 'citizen').length;
  const [loading, setLoading] = useState<string | null>(null); // ID of user being verified
  const [isCreateJudgeOpen, setIsCreateJudgeOpen] = useState(false);

  // Judge Form State
  const [judgeForm, setJudgeForm] = useState({
    name: '',
    email: '',
    password: '',
    courtName: '',
    designation: 'District Judge'
  });

  const handleVerify = async (userId: string) => {
    setLoading(userId);
    try {
      await adminVerifyUser(userId);
      contextVerifyUser(userId); // Update local state
      toast.success("User verified successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify user");
    } finally {
      setLoading(null);
    }
  };

  const handleCreateJudge = async () => {
    setLoading('create-judge');
    try {
      await adminCreateJudge(judgeForm);
      toast.success("Judge account created successfully");
      setIsCreateJudgeOpen(false);
      setJudgeForm({ name: '', email: '', password: '', courtName: '', designation: 'District Judge' });
      // Note context doesn't auto-refresh list from DB, so manual refresh or just wait for re-fetch might be needed
      // For now, simple success message is fine.
    } catch (error) {
      console.error(error);
      toast.error("Failed to create judge account");
    } finally {
      setLoading(null);
    }
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]} title="Admin Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={users.length} icon={Users} variant="primary" />
        <StatCard title="Pending Verification" value={pendingVerification} icon={Shield} />
        <StatCard title="Total Cases" value={cases.length} icon={FileText} />
        <StatCard title="Today's Actions" value={systemLogs.length} icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pending Verifications</h3>
            <Badge variant="outline">{pendingVerification} Pending</Badge>
          </div>
          <div className="space-y-3">
            {users.filter(u => !u.verified && u.role !== 'citizen').map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {/* <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-slate-200" /> */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === 'lawyer' ? 'secondary' : 'default'}>{u.role}</Badge>
                      {u.role === 'lawyer' && <span className="text-xs text-muted-foreground">{u.barNumber}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleVerify(u.id)}
                  disabled={loading === u.id}
                >
                  {loading === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                </Button>
              </div>
            ))}
            {pendingVerification === 0 && <p className="text-muted-foreground text-center py-8 bg-muted/20 rounded-lg">No pending verifications</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Dialog open={isCreateJudgeOpen} onOpenChange={setIsCreateJudgeOpen}>
                <DialogTrigger asChild>
                  <Button className="h-24 flex-col gap-2" variant="outline">
                    <Users className="h-6 w-6" />
                    Create Judge Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Judge Account</DialogTitle>
                    <DialogDescription>
                      detailed access for a new judicial officer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={judgeForm.name} onChange={e => setJudgeForm({ ...judgeForm, name: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={judgeForm.email} onChange={e => setJudgeForm({ ...judgeForm, email: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={judgeForm.password} onChange={e => setJudgeForm({ ...judgeForm, password: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="court">Court Name</Label>
                      <Input id="court" value={judgeForm.courtName} onChange={e => setJudgeForm({ ...judgeForm, courtName: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateJudge} disabled={loading === 'create-judge'}>
                      {loading === 'create-judge' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="h-24 flex-col gap-2" variant="outline" disabled>
                <Activity className="h-6 w-6" />
                View System Logs
              </Button>
            </div>
          </div>

          <div className="card-elevated">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {systemLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.userName} • {log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
