import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { ApiError } from '@/api/client';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Banner } from '@/ui/Banner';
import { Icon } from '@/ui/Icon';
import '@/ui/ui.css';
import './AuthPage.css';

const LOGIN_RE = /^[a-z0-9_]{3,32}$/;

function errorText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.code === 'LOGIN_EXISTS') return 'Такой логин уже существует. Введите другой.';
    if (e.code === 'INVALID_CREDENTIALS' || e.status === 401) return 'Неверный логин или пароль. Введите данные заново.';
    if (e.status === 429) return 'Слишком много попыток. Подождите минуту и повторите.';
  }
  return 'Не удалось выполнить запрос. Проверьте соединение и повторите.';
}

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const isReg = mode === 'register';

  const [l, setL] = useState(''); const [p, setP] = useState(''); const [p2, setP2] = useState('');
  const [fe, setFe] = useState<{ login?: string; password?: string; repeat?: string }>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof fe = {};
    const lc = l.trim().toLowerCase();
    if (isReg && !LOGIN_RE.test(lc)) next.login = 'Логин: 3–32 символа, латиница, цифры и «_».';
    if (!lc) next.login = 'Введите логин.';
    if (!p) next.password = 'Введите пароль.';
    else if (isReg && (p.length < 8 || p.length > 64)) next.password = 'Пароль: от 8 до 64 символов.';
    if (isReg && p2 !== p) next.repeat = 'Пароли не совпадают. Введите ещё раз.';
    setFe(next); setFormErr(null);
    if (Object.keys(next).length) return;

    setBusy(true);
    try { await (isReg ? register(lc, p) : login(lc, p)); nav(from, { replace: true }); }
    catch (err) { setFormErr(errorText(err)); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <section className="auth__hero">
        <div className="auth__brand"><span className="auth__logo"><Icon name="utensils" size={22} /></span>Рецептник</div>
        <h1 className="auth__title t-display"><em>Твоя кухня,</em><br />твои рецепты.</h1>
        <p className="auth__lead">Создавай рецепты, собирай их в папки и находи новые идеи по ингредиентам и времени.</p>
        <div className="plate" style={{ right: 24, top: 24, width: 72, height: 72 }} aria-hidden><i style={{ background: 'var(--orange-light)' }} /></div>
        <div className="plate" style={{ right: 56, bottom: 120, width: 200, height: 200, display: 'none' }} aria-hidden><i style={{ background: 'var(--yellow)' }} /></div>
      </section>

      <section className="auth__panel">
        <form className="auth__form" onSubmit={submit} noValidate>
          <h2 className="t-h2 auth__desktop-title">{isReg ? 'Создайте аккаунт' : 'С возвращением'}</h2>
          <div className="segmented" role="tablist">
            <Link role="tab" aria-selected={!isReg} className="segmented__item" to="/login" style={{ display: 'grid', placeItems: 'center' }}>Вход</Link>
            <Link role="tab" aria-selected={isReg} className="segmented__item" to="/register" style={{ display: 'grid', placeItems: 'center' }}>Регистрация</Link>
          </div>

          {formErr && <Banner kind="error">{formErr}</Banner>}

          <Field label="Логин" value={l} onChange={(e) => setL(e.target.value)} autoComplete="username" autoCapitalize="none"
            placeholder="anna_cook" error={fe.login} hint={isReg ? '3–32 символа, нижний регистр' : undefined} maxLength={32} />
          <Field label="Пароль" type="password" value={p} onChange={(e) => setP(e.target.value)}
            autoComplete={isReg ? 'new-password' : 'current-password'} error={fe.password}
            hint={isReg ? 'От 8 до 64 символов' : undefined} maxLength={64} />
          {isReg && <Field label="Повторите пароль" type="password" value={p2} onChange={(e) => setP2(e.target.value)}
            autoComplete="new-password" error={fe.repeat} maxLength={64} />}

          <Button type="submit" variant="accent" size="lg" block disabled={busy}>
            {busy ? (isReg ? 'Регистрируем…' : 'Входим…') : isReg ? 'Зарегистрироваться' : 'Войти'}
          </Button>

          <p className="auth__switch">
            {isReg ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            <Link to={isReg ? '/login' : '/register'}>{isReg ? 'Войти' : 'Зарегистрироваться'}</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
