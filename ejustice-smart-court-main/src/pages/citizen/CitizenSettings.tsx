
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield, Bell, Globe, Lock, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CitizenSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        language: 'English',
        notifications: true,
        twoFactor: false
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Profile updated successfully");
        }, 1000);
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'Settings' }]}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Account Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your profile, preferences, and security.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-[250px_1fr]">
                    <nav className="flex flex-col space-y-1">
                        <Button
                            variant={activeTab === 'profile' ? "secondary" : "ghost"}
                            className="justify-start font-medium"
                            onClick={() => setActiveTab('profile')}
                        >
                            <User className="mr-2 h-4 w-4" /> Profile
                        </Button>
                        <Button
                            variant={activeTab === 'security' ? "secondary" : "ghost"}
                            className="justify-start font-medium"
                            onClick={() => setActiveTab('security')}
                        >
                            <Shield className="mr-2 h-4 w-4" /> Security
                        </Button>
                        <Button
                            variant={activeTab === 'notifications' ? "secondary" : "ghost"}
                            className="justify-start font-medium"
                            onClick={() => setActiveTab('notifications')}
                        >
                            <Bell className="mr-2 h-4 w-4" /> Notifications
                        </Button>
                    </nav>

                    <div className="space-y-6">
                        {/* Profile Section */}
                        {activeTab === 'profile' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Personal Information</CardTitle>
                                            <CardDescription>Update your personal details.</CardDescription>
                                        </div>
                                        {user?.verified && (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex gap-1">
                                                <Shield className="h-3 w-3" /> Verified Citizen
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="pl-9 bg-muted/50"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Email cannot be changed as it is linked to your identity.</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={loading}>
                                                {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notifications / Preferences */}
                        {activeTab === 'notifications' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preferences</CardTitle>
                                    <CardDescription>Manage language and notifications.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive updates about your case status.</p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications}
                                            onCheckedChange={c => setFormData({ ...formData, notifications: c })}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="grid gap-2">
                                        <Label>Language</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="pl-9" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Security */}
                        {activeTab === 'security' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Manage your password and security settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Change Password</Label>
                                        <Input type="password" placeholder="Current Password" />
                                        <Input type="password" placeholder="New Password" />
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        <Lock className="mr-2 h-4 w-4" /> Update Password
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
