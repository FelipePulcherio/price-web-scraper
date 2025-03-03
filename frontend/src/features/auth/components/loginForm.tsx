import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router';
import { paths } from '@/config/paths';
import { useLogin, loginInputSchema, LoginInput } from '@/lib/auth';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const login = useLogin({
    onSuccess,
  });

  // Handles changes in input fields
  useEffect(() => {
    const subscription = form.watch(() => {
      setApiError(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form]);

  function onSubmit(data: LoginInput) {
    // console.log(data);
    login.mutate(data, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        setApiError(error.messages.toString());
      },
    });
  }

  return (
    <Card className='w-full max-w-xs sm:max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='your.email@example.com'
                      type='email'
                      autoComplete='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        autoComplete='current-password'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' color='#3F3F46' />
                        ) : (
                          <Eye className='h-4 w-4' color='#3F3F46' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {apiError && (
              <p
                data-slot='form-message'
                className='m-0 text-red-500 text-sm dark:text-red-500'
              >
                {apiError}
              </p>
            )}

            <Button
              type='submit'
              className='w-full mt-6'
              disabled={login.isPending || !!apiError}
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex justify-center border-t border-zinc-200 pt-4 mx-6'>
        <p className='text-sm text-zinc-500'>
          Don't have an account?{' '}
          <Link
            to={paths.auth.register.getHref(redirectTo)}
            className='text-zinc-950 hover:underline'
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
