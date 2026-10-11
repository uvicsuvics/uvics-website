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

const data = {
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    github: "#",
  },
  divisi: {
    web: "/divisi/web-development",
    internal: "/divisi/internal-development",
    editor: "/divisi/editor",
    competition: "/divisi/competition-handler",
    pr: "/divisi/public-relations",
  },
  about: {
    history: "/sejarah",
    team: "/pengurus",
    faq: "/faq",
    contact: "/kontak",
  },
  links: {
    unklab: "https://unklab.ac.id",
    pendaftaran: "/join",
    showcase: "/showcase",
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

const socialLinks = [
  { icon: IconBrandInstagram, label: "Instagram", href: data.social.instagram },
  { icon: IconBrandLinkedin, label: "LinkedIn", href: data.social.linkedin },
  { icon: IconBrandGithub, label: "GitHub", href: data.social.github },
];

const aboutLinks = [
  { text: "Organization History", href: data.about.history },
  { text: "Core Team", href: data.about.team },
  { text: "FAQ", href: data.about.faq },
  { text: "Contact Us", href: data.about.contact },
];

const divisiLinks = [
  { text: "Web Development", href: data.divisi.web },
  { text: "Internal Development", href: data.divisi.internal },
  { text: "Editor", href: data.divisi.editor },
  { text: "Competition Handler", href: data.divisi.competition },
  { text: "Public Relations", href: data.divisi.pr },
];

const helpfulLinks = [
  { text: "Universitas Klabat", href: data.links.unklab },
  { text: "Achievements Showcase", href: data.links.showcase },
  { text: "Join as Member", href: data.links.pendaftaran, hasIndicator: true },
];

const contactInfo = [
  { icon: IconMail, text: data.contact.email },
  { icon: IconPhone, text: data.contact.phone },
  { icon: IconMapPin, text: data.contact.address, isAddress: true },
];

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16 w-full">
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
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

            <p className="text-gray-600 mt-6 max-w-md text-center leading-relaxed sm:max-w-xs sm:text-left">
              {data.company.description}
            </p>

            <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="size-6" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-gray-900">About Us</p>
              <ul className="mt-8 space-y-4 text-sm">
                {aboutLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-gray-900">Focus Areas</p>
              <ul className="mt-8 space-y-4 text-sm">
                {divisiLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-gray-900">Helpful Links</p>
              <ul className="mt-8 space-y-4 text-sm">
                {helpfulLinks.map(({ text, href, hasIndicator }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className={`inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors`}
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

            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-gray-900">Contact</p>
              <ul className="mt-8 space-y-4 text-sm">
                {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                  <li key={text}>
                    <div className="flex items-start justify-center gap-2 sm:justify-start">
                      <Icon className="text-primary size-5 mt-0.5 shrink-0" />
                      {isAddress ? (
                        <address className="text-gray-600 flex-1 not-italic text-sm leading-relaxed">
                          {text}
                        </address>
                      ) : (
                        <span className="text-gray-600 flex-1 text-sm">
                          {text}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm text-gray-500">
              <span className="block sm:inline">
                Made with ❤️ in North Minahasa.
              </span>
            </p>

            <p className="text-gray-500 mt-4 text-sm sm:order-first sm:mt-0 font-medium">
              &copy; {new Date().getFullYear()} {data.company.name}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
