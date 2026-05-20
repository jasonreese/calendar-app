import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { CalendarToday as CalendarIcon, PersonAdd as JoinIcon } from '@mui/icons-material';
import { invitationService } from '../services/invitationService';
import { useAuthStore } from '../store/authStore';

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invitation, setInvitation] = useState<{
    calendarName: string;
    inviterName: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    invitationService
      .getInvitation(token)
      .then((data) => setInvitation(data))
      .catch((e) => setError(e?.response?.data?.error || '邀请无效或已过期'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setJoining(true);
    try {
      await invitationService.acceptInvitation(token);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.error || '接受邀请失败');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !invitation) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button component={Link} to="/" variant="outlined">返回首页</Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" gutterBottom>
            {invitation?.inviterName} 邀请你加入日历
          </Typography>
          <Chip
            label={invitation?.calendarName}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '1rem', px: 1, mb: 3 }}
          />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {isAuthenticated ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                当前登录: {user?.displayName || user?.username}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<JoinIcon />}
                onClick={handleAccept}
                disabled={joining}
              >
                {joining ? '加入中...' : '接受邀请'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                你需要先注册或登录才能加入此日历
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<JoinIcon />}
                  component={Link}
                  to={`/register?invite=${token}`}
                >
                  注册并加入
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to={`/login?redirect=/join/${token}`}
                >
                  已有账户？登录
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
