import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerLawyer } from '@/services/api';
import { Scale, Loader2, AlertCircle, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupLawyer() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        barNumber: '',
        specialization: '',
        experience: ''
    });

    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!file) {
                throw new Error('Please upload your Bar Council ID or License for verification.');
            }

            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            data.append('document', file);

            await registerLawyer(data);

            toast.success('Registration successful! Please wait for admin approval.');
            navigate('/login');

        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || 'Registration failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center items-center gap-2">
                    <Scale className="h-10 w-10 text-primary" />
                    <span className="font-serif text-3xl font-bold">eJustice</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground font-serif">
                    Lawyer Registration
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Join the digital bar. <Link to="/login" className="font-medium text-primary hover:underline">Sign in existing account</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-6 border border-red-100">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="barNumber">Bar Council Number</Label>
                                <Input
                                    id="barNumber"
                                    type="text"
                                    required
                                    placeholder="e.g. MH/1234/2020"
                                    value={formData.barNumber}
                                    onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    type="text"
                                    placeholder="e.g. Civil, Criminal"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="experience">Experience (Years)</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Verification Document (ID Card / License)</Label>
                            <div className="mt-1 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 hover:bg-muted/50 transition-colors">
                                <div className="text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {file ? file.name : 'PNG, JPG, PDF up to 10MB'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit for Verification
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
