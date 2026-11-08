import Image from "next/image";
import type { PageHeroContent } from "@/data/mock/about";

interface PageHeroProps {
  hero: PageHeroContent;
}

/**
 * Hero halaman informasi publik dengan pola hero /competitions: foto latar ber-overlay gelap,
 * grid di setengah atas, dan teks di tengah dengan kata penutup judul berwarna biru.
 * Berisi satu-satunya h1 halaman.
 * @param hero - Judul, sorotan judul, deskripsi, dan foto latar
 */
export function PageHero({ hero }: PageHeroProps) {
  const { title, titleHighlight, description, image } = hero;

  return (
    <section
      aria-labelledby="page-hero-heading"
      className="relative flex items-center justify-center w-full min-h-[380px] overflow-hidden text-white bg-gray-950 md:min-h-[440px]"
    >
      <div className="absolute inset-0">
        <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
      </div>
      <div
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none bg-[linear-gradient(to_right,color-mix(in_srgb,white_14%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,white_14%,transparent)_1px,transparent_1px)] bg-[size:4rem_4rem] sm:bg-[size:5rem_5rem] [mask-image:linear-gradient(to_bottom,black,black_40%,transparent)]"
        aria-hidden="true"
      />

      {/* pt-28 menjaga teks tetap di bawah navbar publik yang fixed. */}
      <div className="relative flex flex-col items-center gap-5 mx-auto px-6 pt-28 pb-20 w-full max-w-4xl text-center md:pt-32 md:pb-24">
        <h1
          id="page-hero-heading"
          className="font-heading text-3xl font-bold leading-tight text-balance drop-shadow-md sm:text-5xl md:text-6xl"
        >
          {title} <span className="block text-primary-300 sm:inline">{titleHighlight}</span>
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-gray-200 drop-shadow-sm sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
