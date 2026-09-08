import React, { useState, useMemo } from 'react';
import { AppUser } from '../types';
import { AdminPasswordConfirmModal } from './AdminPasswordConfirmModal';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Lock,
  X
} from 'lucide-react';

interface UserManagementSettingsProps {
  users: AppUser[];
  currentUser: AppUser;
  onClose?: () => void;
  onSaveUser: (user: AppUser) => Promise<void> | void;
  onDeleteUser?: (userId: string) => Promise<void> | void;
}

export const UserManagementSettings: React.FC<UserManagementSettingsProps> = ({
  users,
  currentUser,
  onClose,
  onSaveUser,
  onDeleteUser
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'teacher' | 'staff' | 'admin'>('teacher');
  const [newDepartment, setNewDepartment] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userOperationMsg, setUserOperationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  // Admin Password Confirmation Modal
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetName?: string;
    dangerLevel?: 'danger' | 'warning';
    confirmButtonText?: string;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase().trim();
    return users.filter(
      u =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  const toggleUserExpand = (userId: string) => {
    setExpandedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleToggleExpandAllUsers = () => {
    if (expandedUserIds.size === filteredUsers.length) {
      setExpandedUserIds(new Set());
    } else {
      setExpandedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setNewRole('teacher');
    setNewDepartment('');
    setShowAddUserModal(true);
    setUserOperationMsg(null);
  };

  const handleOpenEditUser = (user: AppUser) => {
    setEditingUser(user);
    setNewUsername(user.username);
    setNewPassword(user.password || '');
    setNewName(user.name);
    setNewRole(user.role);
    setNewDepartment(user.department || '');
    setShowAddUserModal(true);
    setUserOperationMsg(null);
  };

  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserOperationMsg(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setUserOperationMsg({ type: 'error', text: 'กรุณาระบุชื่อผู้ใช้งาน (Username)' });
      return;
    }

    if (!editingUser && users.some(u => u.username.toLowerCase() === cleanUsername)) {
      setUserOperationMsg({ type: 'error', text: `ชื่อผู้ใช้งาน "${cleanUsername}" มีอยู่ในระบบแล้ว` });
      return;
    }

    const userObj: AppUser = {
      id: editingUser ? editingUser.id : cleanUsername,
      username: cleanUsername,
      password: newPassword.trim(),
      name: newName.trim(),
      role: newRole,
      department: newDepartment.trim() || undefined,
      isActive: true,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
    };

    try {
      await onSaveUser(userObj);
      setUserOperationMsg({
        type: 'success',
        text: editingUser ? 'บันทึกการแก้ไขผู้ใช้สำเร็จ' : 'เพิ่มผู้ใช้งานใหม่สำเร็จ'
      });
      setShowAddUserModal(false);
      setEditingUser(null);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewDepartment('');
    } catch (err: any) {
      setUserOperationMsg({ type: 'error', text: err?.message || 'เกิดข้อผิดพลาดในการบันทึกผู้ใช้' });
    }
  };

  const handleDeleteUserClick = (user: AppUser) => {
    if (user.id === 'admin' || user.username === 'admin') {
      alert('ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้');
      return;
    }
    setConfirmAction({
      isOpen: true,
      title: 'ยืนยันการลบบัญชีผู้ใช้งาน',
      description: `คุณกำลังจะลบบัญชีผู้ใช้ "${user.name}" (${user.username}) ออกจากระบบอย่างถาวร`,
      targetName: `บัญชีผู้ใช้: ${user.name} (${user.username}) - สิทธิ์: ${
        user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'staff' ? 'เจ้าหน้าที่' : 'ครู'
      }`,
      dangerLevel: 'danger',
      confirmButtonText: 'ยืนยันลบผู้ใช้งาน',
      onConfirm: async () => {
        try {
          if (onDeleteUser) {
            await onDeleteUser(user.id);
            setUserOperationMsg({ type: 'success', text: `ลบบัญชีผู้ใช้ "${user.name}" เรียบร้อยแล้ว` });
          }
        } catch (err: any) {
          setUserOperationMsg({ type: 'error', text: err?.message || 'ลบผู้ใช้ไม่สำเร็จ' });
        }
      }
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Breadcrumb Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                การกำหนดค่าระบบ
              </span>
              <span className="text-xs text-slate-500 font-medium">ทั้งหมด {users.length} บัญชี</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              จัดการผู้ใช้งานระบบ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              เพิ่ม ลบ แก้ไข และกำหนดสิทธิ์ผู้ดูแลระบบ ครู และเจ้าหน้าที่
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          ผู้ใช้งาน: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : currentUser.role === 'staff' ? '👤 เจ้าหน้าที่' : 'ครู'})
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล, หรือสังกัด..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            {filteredUsers.length > 0 && (
              <button
                type="button"
                onClick={handleToggleExpandAllUsers}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ขยาย/ยุบรายละเอียดทั้งหมด"
              >
                <ChevronsUpDown className="w-4 h-4" />
                <span>{expandedUserIds.size === filteredUsers.length ? 'ยุบทั้งหมด' : 'ขยายทั้งหมด'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAddUser}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มผู้ใช้งานใหม่</span>
            </button>
          </div>
        </div>

        {userOperationMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              userOperationMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {userOperationMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{userOperationMsg.text}</span>
          </div>
        )}

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">ชื่อผู้ใช้ (Username)</th>
                <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4">ระดับสิทธิ์ (Role)</th>
                <th className="py-3 px-4">กลุ่มสาระ/ฝ่าย</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    ไม่พบรายชื่อผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isExpanded = expandedUserIds.has(u.id);
                  return (
                    <React.Fragment key={u.id}>
                      <tr
                        onClick={() => toggleUserExpand(u.id)}
                        className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUserExpand(u.id);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200/70 text-slate-500 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.username}</span>
                          {u.username === 'admin' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-sans font-bold">
                              หลัก
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{u.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-rose-100 text-rose-800'
                                : u.role === 'staff'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {u.role === 'admin' ? '👑 Admin (ผู้ดูแลระบบ)' : u.role === 'staff' ? '🛡️ Staff (เจ้าหน้าที่)' : '👨‍🏫 Teacher (ครู)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.department || '-'}</td>
                        <td className="py-3 px-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.id !== 'admin' && u.username !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUserClick(u)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="ลบผู้ใช้งาน"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Accordion Detail Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                    {u.username.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs">{u.name} (@{u.username})</div>
                                    <div className="text-[11px] text-slate-400">ID: {u.id}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditUser(u)}
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>แก้ไขข้อมูล / รหัสผ่าน</span>
                                  </button>
                                  {u.id !== 'admin' && u.username !== 'admin' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUserClick(u)}
                                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>ลบผู้ใช้</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                  <span className="text-slate-400 font-bold text-[10px] uppercase">ระดับสิทธิ์การทำงาน</span>
                                  <p className="font-bold text-slate-800">
                                    {u.role === 'admin' ? 'ผู้ดูแลระบบสูงสุด (Admin)' : u.role === 'staff' ? 'เจ้าหน้าที่ฝ่ายกิจการนักเรียน (Staff)' : 'ครูผู้สอน / ครูที่ปรึกษา (Teacher)'}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {u.role === 'admin' ? 'มีสิทธิ์จัดการระบบ จัดการผู้ใช้งาน นำเข้า/ส่งออก และรีเซ็ตข้อมูล' : u.role === 'staff' ? 'มีสิทธิ์ตัดคะแนน เพิ่มคะแนน ดูข้อมูลนักเรียน และอนุญาตสิทธิ์การดู' : 'มีสิทธิ์ค้นหาและดูข้อมูลนักเรียน พร้อมอนุญาตให้นักเรียนเปิดดูคะแนน'}
                                  </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                  <span className="text-slate-400 font-bold text-[10px] uppercase">หน่วยงาน / กลุ่มสาระฯ</span>
                                  <p className="font-bold text-slate-800">{u.department || 'ไม่ระบุ'}</p>
                                  <span className="text-[11px] text-slate-500">
                                    ใช้สำหรับจำแนกหน้าที่และสังกัดในการบันทึกข้อมูล
                                  </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                  <span className="text-slate-400 font-bold text-[10px] uppercase">การยืนยันตัวตน</span>
                                  <p className="font-mono text-slate-700 flex items-center gap-1 font-bold">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    {u.password ? '•••••••• (ตั้งค่าแล้ว)' : 'ไม่มีรหัสผ่าน'}
                                  </p>
                                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> ใช้งานได้ปกติ
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Sub-Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm">
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานระบบใหม่'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-indigo-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser && editingUser.username === 'admin'}
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="เช่น teacher02, staff_somsak"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  รหัสผ่าน (Password)
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่าน"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="เช่น ครูสมศรี ใจดี"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  บทบาทและระดับสิทธิ์
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                >
                  <option value="teacher">👨‍🏫 ครู (ดูข้อมูล / อนุญาตให้นักเรียนดู)</option>
                  <option value="staff">🛡️ เจ้าหน้าที่ (หัก/เพิ่มคะแนน / อนุญาตให้นักเรียนดู)</option>
                  <option value="admin">👑 ผู้ดูแลระบบ (จัดการทุกอย่างในระบบ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  กลุ่มสาระฯ / ฝ่ายงาน (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value)}
                  placeholder="เช่น ฝ่ายกิจการนักเรียน, กลุ่มสาระฯ ภาษาไทย"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Password Confirm Modal */}
      <AdminPasswordConfirmModal
        isOpen={confirmAction.isOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        targetName={confirmAction.targetName}
        dangerLevel={confirmAction.dangerLevel}
        confirmButtonText={confirmAction.confirmButtonText}
        onClose={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
      />
    </div>
  );
};
