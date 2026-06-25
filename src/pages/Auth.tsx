import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Apple, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email, password);
        if (err) {
          if (err.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos');
          } else {
            setError(err.message);
          }
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
        const { error: err } = await signUp(email, password);
        if (err) {
          if (err.message.includes('already registered')) {
            setError('Este email já está cadastrado');
          } else {
            setError(err.message);
          }
        } else {
          setMessage('Verifique seu email para confirmar o cadastro');
        }
      } else if (mode === 'forgot') {
        const { error: err } = await resetPassword(email);
        if (err) {
          setError(err.message);
        } else {
          setMessage('Email de recuperação enviado!');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Bem-vindo de volta</h1>
            <p className="text-secondary-500">Entre para continuar seu acompanhamento nutricional</p>
          </>
        );
      case 'signup':
        return (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Criar conta</h1>
            <p className="text-secondary-500">Comece sua jornada nutricional hoje</p>
          </>
        );
      case 'forgot':
        return (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Recuperar senha</h1>
            <p className="text-secondary-500">Enviaremos instruções para seu email</p>
          </>
        );
      case 'reset':
        return (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Nova senha</h1>
            <p className="text-secondary-500">Digite sua nova senha</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Apple className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">NutriTracker</h1>
            <p className="text-white/80 text-sm">Pro</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Seu acompanhamento nutricional completo
          </h2>
          <p className="text-white/80 text-lg">
            Monitore alimentação, exercícios, hidratação e evolução física com precisão e facilidade.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Controle calórico preciso',
              'Metas personalizadas',
              'Relatórios detalhados',
              'Sincronização em nuvem',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-white/90">
                <div className="w-2 h-2 rounded-full bg-white/80" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">© 2024 NutriTracker Pro</p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                <Apple className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">NutriTracker</h1>
                <p className="text-secondary-500 text-sm">Pro</p>
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">{renderModeContent()}</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Carregando...
                </span>
              ) : (
                <>
                  {mode === 'login' && 'Entrar'}
                  {mode === 'signup' && 'Criar conta'}
                  {mode === 'forgot' && 'Enviar email'}
                  {mode === 'reset' && 'Atualizar senha'}
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-2 text-sm">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Esqueceu sua senha?
                </button>
                <p className="text-secondary-500 dark:text-secondary-400">
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Criar conta
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-secondary-500 dark:text-secondary-400">
                Já tem uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Entrar
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-primary-500 hover:text-primary-600 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
