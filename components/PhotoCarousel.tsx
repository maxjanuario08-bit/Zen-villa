"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  images: readonly string[];
  alts: readonly string[];
  fallbackAlt: string;
  prevLabel: string;
  nextLabel: string;
};

export default function PhotoCarousel({ images, alts, fallbackAlt, prevLabel, nextLabel }: Props) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const show = useCallback(
    (next: number) => {
      if (count < 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => show(index + 1), 6000);
    return () => window.clearInterval(id);
  }, [count, index, paused, show]);

  if (count === 0) return null;

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-lagoon-dark/10 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${index * (100 / count)}%)`,
          transition: "transform 0.45s ease-out",
        }}
      >
        {images.map((src, i) => (
          <div key={src} className="relative h-full shrink-0" style={{ width: `${100 / count}%` }}>
            {/* width/height keep the image in flow so it actually slides with the bandeau */}
            <Image
              src={src}
              alt={alts[i] ?? fallbackAlt}
              width={1600}
              height={1000}
              className="h-full w-full object-cover pointer-events-none"
              sizes="(max-width: 1024px) 100vw, 72rem"
              priority={i === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-20 w-[28%] cursor-pointer bg-transparent"
            aria-label={prevLabel}
            onClick={() => {
              setPaused(true);
              show(index - 1);
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-20 w-[28%] cursor-pointer bg-transparent"
            aria-label={nextLabel}
            onClick={() => {
              setPaused(true);
              show(index + 1);
            }}
          />
          <div className="pointer-events-none absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-lagoon-dark shadow-md sm:left-5">
            ‹
          </div>
          <div className="pointer-events-none absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-lagoon-dark shadow-md sm:right-5">
            ›
          </div>
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setPaused(true);
                  show(i);
                }}
                className={`h-2.5 rounded-full ${i === index ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`}
                aria-label={`${i + 1} / ${count}`}
                aria-current={i === index ? true : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
