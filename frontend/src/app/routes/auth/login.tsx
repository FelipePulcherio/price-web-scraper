import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/loginForm';
import { toast } from 'sonner';

const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <LoginForm
      onSuccess={() => {
        toast.success('Sign in successful', {
          description: 'You have been signed in to your account.',
        });

        navigate(`${redirectTo ? `${redirectTo}` : paths.root.getHref()}`, {
          replace: true,
        });
      }}
    />
  );
};

export default LoginRoute;
