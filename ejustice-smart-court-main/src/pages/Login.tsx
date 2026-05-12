import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Scale, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'citizen' // Default role for login selector
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }

      await login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      toast.success(`Welcome back!`);

      // Redirect based on role
      switch (formData.role) {
        case 'citizen': navigate('/citizen/dashboard'); break;
        case 'lawyer': navigate('/lawyer/dashboard'); break;
        case 'judge': navigate('/judge/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <Scale className="h-12 w-12 text-gold" />
            <span className="font-serif text-3xl font-bold text-white">eJustice</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-serif font-bold text-white leading-tight">
            Smart Courtroom & AI-Powered Case Management
          </h1>

          <p className="mt-6 text-lg text-white/80 max-w-md">
            The future of judicial efficiency. Secure, transparent, and accessible justice for all.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Scale className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold">eJustice</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-muted-foreground">
              Access your dashboard and manage your cases
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-6 border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a...</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="citizen">Citizen</option>
                <option value="lawyer">Lawyer</option>
                <option value="judge">Judge</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <div className="mt-2 space-x-4">
              <Link to="/signup/citizen" className="font-medium text-primary hover:underline">
                Sign up as Citizen
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/signup/lawyer" className="font-medium text-primary hover:underline">
                Sign up as Lawyer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
