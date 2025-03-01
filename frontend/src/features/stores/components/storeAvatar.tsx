import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function StoreAvatar({
  subtitle,
  url,
  fallback,
}: {
  subtitle: string;
  url: string;
  fallback: string;
}): React.ReactNode {
  return (
    <div className='flex flex-col justify-center items-center gap-2'>
      <Avatar className='size-12 md:size-14'>
        <AvatarImage src={url} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className='w-19 text-center text-xs/4 text-zinc-800'>{subtitle}</div>
    </div>
  );
}
