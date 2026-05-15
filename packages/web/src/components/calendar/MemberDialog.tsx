import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Select,
  MenuItem,
  IconButton,
  Typography,
  TextField,
  Autocomplete,
  Box,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { calendarService } from '../../services/calendarService';
import { useAuthStore } from '../../store/authStore';
import type { CalendarMember } from '@calendar-app/shared';
import { MemberRole } from '@calendar-app/shared';

interface UserOption {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
}

const ROLE_LABELS: Record<MemberRole, string> = {
  [MemberRole.OWNER]: '所有者',
  [MemberRole.EDITOR]: '编辑者',
  [MemberRole.VIEWER]: '查看者',
};

const ROLE_COLORS: Record<MemberRole, 'default' | 'primary' | 'warning'> = {
  [MemberRole.OWNER]: 'primary',
  [MemberRole.EDITOR]: 'warning',
  [MemberRole.VIEWER]: 'default',
};

interface MemberDialogProps {
  open: boolean;
  onClose: () => void;
  calendarId: string;
  calendarName: string;
  members: CalendarMember[];
  ownerId: string;
  onMembersChanged: () => void;
}

export default function MemberDialog({
  open,
  onClose,
  calendarId,
  calendarName,
  members,
  ownerId,
  onMembersChanged,
}: MemberDialogProps) {
  const { user } = useAuthStore();
  const [localMembers, setLocalMembers] = useState<CalendarMember[]>([]);
  const [searchOptions, setSearchOptions] = useState<UserOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [addRole, setAddRole] = useState<MemberRole>(MemberRole.EDITOR);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user?.id === ownerId;

  useEffect(() => {
    if (open) {
      setLocalMembers([...members]);
      setError('');
      setSelectedUser(null);
    }
  }, [open, members]);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSearchOptions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const users = await calendarService.searchUsers(q);
      // 过滤掉已是成员的用户
      const existingIds = new Set(localMembers.map((m) => m.userId));
      setSearchOptions(users.filter((u) => !existingIds.has(u.id)));
    } catch {
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, [localMembers]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setAdding(true);
    setError('');
    try {
      const member = await calendarService.addMember(calendarId, {
        userId: selectedUser.id,
        role: addRole,
      });
      // 用服务器返回的 member（包含 user 信息）
      setLocalMembers((prev) => [...prev, member]);
      setSelectedUser(null);
      onMembersChanged();
    } catch (e: any) {
      setError(e?.response?.data?.error || '添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    setError('');
    try {
      const updated = await calendarService.updateMemberRole(calendarId, memberId, { role: newRole });
      setLocalMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      onMembersChanged();
    } catch (e: any) {
      setError(e?.response?.data?.error || '更新角色失败');
    }
  };

  const handleRemove = async (memberId: string) => {
    setError('');
    try {
      await calendarService.removeMember(calendarId, memberId);
      setLocalMembers((prev) => prev.filter((m) => m.id !== memberId));
      onMembersChanged();
    } catch (e: any) {
      setError(e?.response?.data?.error || '移除失败');
    }
  };

  const ownerMember = localMembers.find((m) => m.userId === ownerId);
  const otherMembers = localMembers.filter((m) => m.userId !== ownerId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        管理成员 — {calendarName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 所有者信息 */}
        {ownerMember && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">日历所有者</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                {(ownerMember.user?.displayName || ownerMember.user?.username || '?')[0].toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {ownerMember.user?.displayName || ownerMember.user?.username} ({ownerMember.user?.username})
              </Typography>
              <Chip label="所有者" size="small" color="primary" />
            </Box>
          </Box>
        )}

        {/* 添加成员 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
              size="small"
              options={searchOptions}
              loading={searchLoading}
              value={selectedUser}
              onChange={(_, v) => setSelectedUser(v)}
              onInputChange={(_, v) => handleSearch(v)}
              getOptionLabel={(u) => `${u.displayName || u.username} (${u.email})`}
              renderInput={(params) => (
                <TextField {...params} label="搜索用户" placeholder="输入邮箱或用户名" />
              )}
              filterOptions={(x) => x}
              sx={{ flexGrow: 1 }}
              disabled={!isOwner}
            />
            <Select
              size="small"
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as MemberRole)}
              disabled={!isOwner}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value={MemberRole.EDITOR}>编辑者</MenuItem>
              <MenuItem value={MemberRole.VIEWER}>查看者</MenuItem>
            </Select>
            <Button
              variant="contained"
              size="small"
              disabled={!selectedUser || !isOwner || adding}
              onClick={handleAddMember}
              startIcon={<PersonAddIcon />}
              sx={{ flexShrink: 0 }}
            >
              添加
            </Button>
          </Box>
          {!isOwner && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              仅日历所有者可以管理成员
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* 成员列表 */}
        {otherMembers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            暂无其他成员
          </Typography>
        )}
        <List dense disablePadding>
          {otherMembers.map((member) => (
            <ListItem
              key={member.id}
              secondaryAction={
                isOwner && (
                  <IconButton edge="end" size="small" onClick={() => handleRemove(member.id)} title="移除成员">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                  {(member.user?.displayName || member.user?.username || '?')[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.user?.displayName || member.user?.username || 'Unknown'}
                secondary={member.user?.username}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              {isOwner ? (
                <Select
                  size="small"
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                  sx={{ minWidth: 100, mr: 5, height: 32 }}
                >
                  <MenuItem value={MemberRole.EDITOR}>编辑者</MenuItem>
                  <MenuItem value={MemberRole.VIEWER}>查看者</MenuItem>
                </Select>
              ) : (
                <Chip
                  label={ROLE_LABELS[member.role]}
                  size="small"
                  color={ROLE_COLORS[member.role]}
                  sx={{ mr: 5 }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
}
