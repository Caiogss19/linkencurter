import { redirect } from 'next/navigation';
import { checkPassword, createSessionCookie, isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function loginAction(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    redirect('/login?error=1');
  }
  createSessionCookie();
  redirect('/');
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (isAuthenticated()) redirect('/');

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div className="brand-name">
            <strong>Spark Maxx</strong>
            <span>Link Shortener</span>
          </div>
        </div>

        <h1>Acesso restrito</h1>
        <p className="subtitle">Use a senha do time pra entrar.</p>

        <form className="form" action={loginAction}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            autoFocus
          />
          {searchParams.error ? (
            <p className="error">Senha incorreta.</p>
          ) : null}
          <button className="primary" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
