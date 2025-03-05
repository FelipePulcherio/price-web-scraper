import { Logo } from '@/features/logo/components/logo';
import * as React from 'react';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='w-screen h-screen flex flex-col justify-around items-center'>
      <header className='w-full bg-gradient-to-t from-zinc-700 to-zinc-950 flex justify-center items-center'>
        <div className='wrapper w-full max-w-5xl p-2 md:p-4'>
          <Logo className='h-9 gap-1 flex justify-start items-center text-zinc-50' />
        </div>
      </header>
      <main className='size-full max-w-5xl px-2 py-4 flex flex-col justify-center items-center md:p-4'>
        {children}
      </main>
      <footer className='w-full h-16 md:h-21 bg-gradient-to-t from-zinc-950 to-zinc-700 flex flex-col justify-center items-center'></footer>
    </div>
  );
};
