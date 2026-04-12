import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export default function SessionTimeout() {
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const timerRef = useRef<any>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isAuth) {
      timerRef.current = setTimeout(() => {
        console.warn('🕒 [SessionManager] Inactivity detected. Locking out section...');
        dispatch(logout());
        window.location.href = '/login?message=session_expired';
      }, TIMEOUT_DURATION);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    if (isAuth) {
      resetTimer();
      events.forEach(event => window.addEventListener(event, resetTimer));
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuth, dispatch]);

  return null; // Side-effect only component
}
