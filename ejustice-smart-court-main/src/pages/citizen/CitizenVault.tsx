
import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Shield,
    FileText,
    Upload,
    RefreshCw,
    Lock,
    File,
    Download,
    Hash,
    Folder,
    ArrowLeft,
    User,
    Trash2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getDocuments, uploadDocument, deleteDocument } from '@/services/api';
import { Document } from '@/types';

export default function CitizenVault() {
    const { user, cases } = useAuth();
    const citizenCases = cases.filter(c => c.citizenId === user?.id);

    // State for view navigation
    const [currentFolder, setCurrentFolder] = useState<string | null>(null); // null = root view

    // Real data state
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Upload Form State
    const [uploadCaseId, setUploadCaseId] = useState<string>('personal');
    const [file, setFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch documents on mount
    useEffect(() => {
        loadDocuments();
    }, [user]);

    const loadDocuments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const docs = await getDocuments(user.id);
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents", error);
            toast.error("Failed to load your vault documents");
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredDocuments = useMemo(() => {
        if (!currentFolder) return [];
        if (currentFolder === 'personal') {
            return documents.filter(d => !d.caseId); // Personal docs have null caseId
        }
        return documents.filter(d => d.caseId === currentFolder);
    }, [currentFolder, documents]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        if (!user) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user.id);
            // If uploadCaseId is 'personal', send it as such, backend handles it as null
            formData.append('caseId', uploadCaseId);

            await uploadDocument(formData);

            toast.success("Document uploaded and securely hashed on blockchain");
            setIsDialogOpen(false);
            setFile(null);
            setUploadCaseId('personal');
            loadDocuments(); // Refresh list

        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (confirm("Are you sure you want to remove this document from your vault? This action cannot be undone.")) {
            try {
                await deleteDocument(docId);
                toast.success("Document deleted");
                setDocuments(prev => prev.filter(d => d.id !== docId));
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete document");
            }
        }
    }

    const formatSize = (size: string | number) => {
        // If coming from DB as string "X MB", return as is. If number, format it.
        // Our backend returns "X MB" string currently.
        return size;
    };

    // Helper to view file (in real app, this would use a signed URL or auth token)
    const handleViewFile = (url?: string) => {
        if (url) {
            window.open(`https://ejustice-smart-court.onrender.com${url}`, '_blank');
        }
    };

    return (
        <DashboardLayout breadcrumbs={[
            { label: 'Digital Evidence Vault', href: '/citizen/vault' },
            ...(currentFolder ? [{ label: currentFolder === 'personal' ? 'Personal Files' : 'Case Folder' }] : [])
        ]}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">
                            {currentFolder ? (currentFolder === 'personal' ? 'Personal Vault' : 'Case Evidence') : 'My Secure Vault'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Blockchain Verified Storage
                            </span>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-primary">
                                <Upload className="h-4 w-4" /> Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Secure Document Upload</DialogTitle>
                                <DialogDescription>
                                    Upload files to your Personal Vault or a specific Case Folder.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Destination Folder</Label>
                                    <Select value={uploadCaseId} onValueChange={setUploadCaseId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select folder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="personal">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" /> Personal Vault
                                                </div>
                                            </SelectItem>
                                            {citizenCases.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Folder className="h-4 w-4" /> {c.title} ({c.id})
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>File</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <div className="pointer-events-none">
                                            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            {file ? (
                                                <p className="text-sm font-medium text-primary">{file.name}</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Click to browse or drag file here</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isUploading}>
                                        {isUploading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Hashing & Uploading...
                                            </>
                                        ) : (
                                            'Upload & Verify'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!currentFolder ? (
                /* Root View: Folders */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Personal Folder */}
                    <Card
                        className="card-hover cursor-pointer border-l-4 border-l-purple-500 hover:shadow-lg transition-all"
                        onClick={() => setCurrentFolder('personal')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Personal Folder</h3>
                                    <p className="text-sm text-muted-foreground">Private documents</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                <span>{documents.filter(d => !d.caseId).length} Files</span>
                                <Folder className="h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Case Folders */}
                    {citizenCases.map(c => (
                        <Card
                            key={c.id}
                            className="card-hover cursor-pointer border-l-4 border-l-primary hover:shadow-lg transition-all"
                            onClick={() => setCurrentFolder(c.id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Folder className="h-6 w-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-semibold text-lg truncate">{c.title}</h3>
                                        <p className="text-sm text-muted-foreground">{c.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                    <span>{documents.filter(d => d.caseId === c.id).length} Files</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${c.status === 'open' ? 'bg-green-100 text-green-700' :
                                            c.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                                            }`}>{c.status}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {citizenCases.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            You don't have any active cases yet. File a case to see folders here.
                        </div>
                    )}
                </div>
            ) : (
                /* Folder Content View */
                <div className="space-y-6">
                    <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent" onClick={() => setCurrentFolder(null)}>
                        <ArrowLeft className="h-4 w-4" /> Back to Vault
                    </Button>

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin mx-auto opacity-50" /></div>
                        ) : filteredDocuments.map((doc) => (
                            <Card key={doc.id} className="card-hover border-l-4 border-l-emerald-500/50">
                                <CardContent className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <File className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2 cursor-pointer hover:underline" onClick={() => handleViewFile(doc.url)}>
                                                {doc.name}
                                                {/* <Badge variant="secondary" className="text-xs font-normal">v1</Badge> */}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1" title={doc.hash}>
                                                    <Hash className="h-3 w-3" />
                                                    {doc.hash ? doc.hash.substring(0, 10) + '...' : 'Pending'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatSize(doc.size)}</span>
                                                <span>•</span>
                                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                            <Shield className="h-4 w-4 text-emerald-600" />
                                            <span className="text-xs font-bold text-emerald-700">VERIFIED ON CHAIN</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(doc.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Download" onClick={() => handleViewFile(doc.url)}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {!loading && filteredDocuments.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                <Folder className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No files in this folder yet.</p>
                                <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                                    Upload a document
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
