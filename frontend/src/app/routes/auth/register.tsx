import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { RegisterForm } from '@/features/auth/components/registerForm';
import { toast } from 'sonner';

export default function RegisterRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <RegisterForm
      onSuccess={() => {
        toast.success('Register successful', {
          description: 'You have been signed in to your account.',
        });

        navigate(`${redirectTo ? `${redirectTo}` : paths.root.getHref()}`, {
          replace: true,
        });
      }}
    />
  );
}
