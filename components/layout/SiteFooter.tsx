import Image from "next/image";
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";
import { PUBLIC_NAVIGATION } from "@/config/public-navigation";

interface FooterLink {
  text: string;
  href: string;
  external?: boolean;
  hasIndicator?: boolean;
}

const data = {
  social: {
    instagram: "#",
    linkedin: "#",
    github: "#",
  },
  contact: {
    email: "hello@uvics.org",
    phone: "+62 812 3456 7890",
    address:
      "Universitas Klabat, Airmadidi, Minahasa Utara, Sulawesi Utara, Indonesia",
  },
  company: {
    name: "UVICS",
    description:
      "Unklab Virtue In Computer Science. A platform for outstanding students across faculties to collaborate, innovate, and compete at National and International levels.",
    logo: "/logo/logo_uvics.webp",
  },
};

function navSubLinks(link: string, group?: string): FooterLink[] {
  const subItems = PUBLIC_NAVIGATION.find((item) => item.link === link)?.subItems ?? [];
  return subItems
    .filter((sub) => !group || sub.group === group)
    .map((sub) => ({ text: sub.title, href: sub.href }));
}

// Kolom diturunkan dari navbar (config/public-navigation.ts) agar link footer dan navbar selalu sama.
const exploreLinks: FooterLink[] = PUBLIC_NAVIGATION.filter((item) => !item.subItems).map((item) => ({
  text: item.name,
  href: item.link,
}));
const organizationLinks = [...navSubLinks("/about", "Profil Organisasi"), ...navSubLinks("/organization")];
const informationLinks = navSubLinks("/about", "Aktivitas & Media");
const connectLinks: FooterLink[] = [
  { text: "Join UVICS", href: "/join", hasIndicator: true },
  { text: "Kontak", href: "/contact" },
  { text: "Universitas Klabat", href: "https://unklab.ac.id", external: true },
];

const contactInfo = [
  { icon: IconMail, text: data.contact.email },
  { icon: IconPhone, text: data.contact.phone },
  { icon: IconMapPin, text: data.contact.address, isAddress: true },
];

const socialLinks = [
  { icon: IconBrandInstagram, label: "Instagram", href: data.social.instagram },
  { icon: IconBrandLinkedin, label: "LinkedIn", href: data.social.linkedin },
  { icon: IconBrandGithub, label: "GitHub", href: data.social.github },
];

function FooterLinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-lg font-bold text-gray-900">{title}</p>
      <ul className="mt-8 space-y-4 text-sm">
        {links.map(({ text, href, external, hasIndicator }) => (
          <li key={text}>
            <Link
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <span>{text}</span>
              {hasIndicator && (
                <span className="relative flex size-2">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-primary relative inline-flex size-2 rounded-full" />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16 w-full">
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex justify-center gap-2 sm:justify-start items-center">
              <Image
                width={143}
                height={144}
                sizes="40px"
                src={data.company.logo}
                alt="UVICS Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            <p className="text-gray-600 mt-6 max-w-md mx-auto text-center leading-relaxed sm:mx-0 sm:max-w-xs sm:text-left">
              {data.company.description}
            </p>
          </div>

          <div className="lg:col-span-2">
            <FooterLinkList title="Explore" links={exploreLinks} />
          </div>

          <div className="lg:col-span-2">
            <FooterLinkList title="Organization" links={organizationLinks} />
          </div>

          <div className="lg:col-span-2">
            <FooterLinkList title="Information" links={informationLinks} />
          </div>

          {/* Connect */}
          <div className="sm:col-span-2 lg:col-span-3">
            <FooterLinkList title="Connect" links={connectLinks} />

            <ul className="mt-6 space-y-4 text-sm">
              {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                <li key={text}>
                  <div className="flex items-start justify-center gap-2 sm:justify-start">
                    <Icon className="text-primary size-5 mt-0.5 shrink-0" />
                    {isAddress ? (
                      <address className="text-gray-600 flex-1 not-italic text-sm leading-relaxed">
                        {text}
                      </address>
                    ) : (
                      <span className="text-gray-600 flex-1 text-sm">{text}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex justify-center gap-6 sm:justify-start">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-500 hover:text-primary transition-colors">
                    <span className="sr-only">{label}</span>
                    <Icon className="size-6" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm text-gray-500">
              <span className="block sm:inline">Made with ❤️ in North Minahasa.</span>
            </p>

            <p className="text-gray-500 mt-4 text-sm sm:order-first sm:mt-0 font-medium">
              &copy; {new Date().getFullYear()} {data.company.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
