"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Users, UserPlus, Edit2, Trash2, Search, Mail, Phone, Shield, Check, AlertCircle } from 'lucide-react';
import { usersApi } from '@/src/api/users';
import { User } from '@/src/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
    role: 'customer' | 'admin' | 'manager';
}

interface Notification {
    message: string;
    type: 'success' | 'error';
}

function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notification | null>(null);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data: User[] = await usersApi.getAllCustomers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            setError('תקלה בטעינת משתמשים. אנא נסה שוב.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            role: 'customer',
        });
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'customer'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            role: 'customer'
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await usersApi.create(formData);
                showNotification('המשתמש נוצר בהצלחה');
            } else if (selectedUser) {
                await usersApi.update(selectedUser.id, formData);
                showNotification('המשתמש עודכן בהצלחה');
            }
            closeModal();
            loadUsers();
        } catch (err) {
            showNotification('הפעולה נכשלה. אנא נסה שוב.', 'error');
            console.error(err);
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            await usersApi.delete(userId);
            showNotification('המשתמש נמחק בהצלחה');
            setDeleteConfirm(null);
            loadUsers();
        } catch (err) {
            showNotification('תקלה במחיקת משתמש.', 'error');
            console.error(err);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-black rounded-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ניהול משתמשים</h1>
                            <p className="text-gray-600 mt-1">נהל חשבונות לקוחות והרשאות</p>
                        </div>
                    </div>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="חפש לפי שם, דוא״ל או טלפון..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                        >
                            הוסף משתמש חדש
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-600">
                            <AlertCircle className="w-12 h-12 mb-4" />
                            <p className="text-lg font-medium">{error}</p>
                            <button onClick={loadUsers} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                נסה שוב
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Users className="w-12 h-12 mb-4" />
                            <p className="text-lg font-medium">לא נמצאו משתמשים</p>
                            <p className="text-sm mt-1">נסה להתאים את החיפוש או להוסיף משתמש חדש</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">משתמש</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">יצירת קשר</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">תפקיד</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {user.firstName?.charAt(0).toUpperCase() || 'U'}
                                                        {user.lastName?.charAt(0).toUpperCase() || 'N'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.firstName || 'N/A'}</div>
                                                        <div className="font-medium text-gray-900">{user.lastName || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {user.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="w-4 h-4" />
                                                            {user.email}
                                                        </div>
                                                    )}
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-4 h-4" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-gray-400" />
                                                    <span className="capitalize text-sm font-medium text-gray-700">{user.role || 'customer'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600">
                        מציג <span className="font-semibold text-gray-900">{filteredUsers.length}</span> מתוך{' '}
                        <span className="font-semibold text-gray-900">{users.length}</span> משתמשים
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === 'create' ? 'הוסף משתמש חדש' : 'ערוך משתמש'}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === 'create' 
                                ? 'הזן את פרטי המשתמש החדש' 
                                : 'עדכן את פרטי המשתמש'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">שם פרטי</Label>
                            <Input
                                id="firstName"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                placeholder="יוחנן"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">שם משפחה</Label>
                            <Input
                                id="lastName"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                placeholder="כהן"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">כתובת דוא״ל</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">מספר טלפון</Label>
                            <Input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+972 50 1234567"
                            />
                        </div>
                        {modalMode === 'create' && (
                            <div className="space-y-2">
                                <Label htmlFor="password">סיסמה</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleInputChange}
                                    required={modalMode === 'create'}
                                    placeholder="לפחות 8 תווים, אות גדולה, אות קטנה ומספר"
                                />
                                <p className="text-xs text-gray-500">לפחות 8 תווים, אות גדולה אחת, אות קטנה אחת ומספר אחד</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="role">תפקיד</Label>
                            <Select name="role" value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}>
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">לקוח</SelectItem>
                                    <SelectItem value="admin">מנהל</SelectItem>
                                    <SelectItem value="manager">מנהל עסק</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                ביטול
                            </Button>
                            <Button type="submit">
                                {modalMode === 'create' ? 'צור משתמש' : 'שמור שינויים'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>אישור מחיקה</AlertDialogTitle>
                        <AlertDialogDescription>
                            האם אתה בטוח שברצונך למחוק משתמש זה? כל הנתונים הקשורים ימחקו לצמיתות.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        מחק משתמש
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default UsersManagement;
