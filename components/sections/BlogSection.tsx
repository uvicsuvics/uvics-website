import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  summary: string;
  author: string;
  published: string;
  url: string;
  image: string;
  tags?: string[];
}

const posts: Post[] = [
  {
    id: "post-1",
    title: "Winning the National AI Hackathon 2024: A Journey",
    summary:
      "Discover the behind-the-scenes story of how our team built a sustainable agriculture AI model and secured the 1st place in the national competition.",
    author: "UVICS Core Team",
    published: "20 May 2024",
    url: "#",
    image: "/images/img/foto-14.webp",
    tags: ["Hackathon", "AI/ML", "Competition"],
  },
  {
    id: "post-2",
    title: "UI/UX Design Workshop: Designing for Accessibility",
    summary:
      "A recap of our latest workshop where members learned the fundamentals of inclusive design and created accessible prototypes for real-world applications.",
    author: "Design Division",
    published: "12 Apr 2024",
    url: "#",
    image: "/images/img/foto15.webp",
    tags: ["Workshop", "UI/UX", "Community"],
  },
];

export function BlogSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center gap-16">
        <div className="text-center">
          <h2 className="mx-auto mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight lg:max-w-3xl">
            Latest Updates <span className="text-primary">& Insights</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-500 md:text-lg">
            Stay updated with our latest activities, competition stories, tech
            insights, and community events at UVICS.
          </p>
        </div>

        <div className="grid gap-y-10 sm:grid-cols-12 sm:gap-y-12 md:gap-y-16 lg:gap-y-20 w-full">
          {posts.map((post) => (
            <article
              key={post.id}
              className="order-last sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-blue-600 font-semibold md:gap-5 lg:gap-6">
                      {post.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl leading-tight">
                    <Link
                      href={post.url}
                      className="hover:text-blue-600 transition-colors duration-300"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-gray-600 md:mt-5 leading-relaxed">
                    {post.summary}
                  </p>

                  <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                    <span className="text-gray-900 font-medium">
                      {post.author}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{post.published}</span>
                  </div>

                  <div className="mt-6 flex items-center space-x-2 md:mt-8">
                    <Link
                      href={post.url}
                      className="inline-flex items-center font-bold !text-gray-900 hover:!text-blue-600 transition-colors md:text-base group"
                    >
                      <span>Read full story</span>
                      <IconArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                <div className="order-first sm:order-last sm:col-span-5">
                  <Link href={post.url} className="block group">
                    <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-[2rem] shadow-xl shadow-gray-200/50">
                      <Image
                        fill
                        sizes="(min-width: 640px) 42vw, 100vw"
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="pt-4">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
