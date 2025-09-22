import { PropsWithChildren } from 'react';

export default function Masonry({ children }: PropsWithChildren) {
  return <div className="columns-2 md:columns-4 gap-4 space-y-4">{children}</div>;
}
