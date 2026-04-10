'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const photos = [
  { src: '/images/ciro-gallery-brasov.jpg', alt: 'Ciro em Brașov, Romênia', location: 'Brașov' },
  { src: '/images/ciro-gallery-petra.jpg', alt: 'Ciro em Petra, Jordânia', location: 'Petra' },
  { src: '/images/ciro-gallery-roma.jpg', alt: 'Ciro em Roma, Itália', location: 'Roma' },
  { src: '/images/ciro-gallery-bsas.jpg', alt: 'Ciro em Buenos Aires, Argentina', location: 'Buenos Aires' },
  { src: '/images/ciro-gallery-santiago.jpg', alt: 'Ciro em Santiago, Chile', location: 'Santiago' },
];

export const GalleryStrip = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-16 overflow-hidden bg-white/50', className)}>
      <div className="container-site max-w-7xl mx-auto px-6 mb-8">
        <p className="label-xs text-olcan-navy/40 text-center">Uma jornada construída em campo</p>
      </div>
      <div className="flex gap-4 animate-fade-up overflow-x-auto pb-4 px-6 scrollbar-hide">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden group shadow-lg shadow-olcan-navy/10"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="256px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-olcan-navy/60 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-widest drop-shadow">
              {photo.location}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
