import Image from "next/image";
import React from "react";
import { Button } from "@/src/components/atoms/Button/Button";
import { Trophy, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full overflow-x-clip bg-white text-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Text */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Unklab Virtue In{" "}
            <span className="text-primary">Computer Science</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            UVICS is an exclusive platform that gathers outstanding students
            from all faculties at <strong>Universitas Klabat</strong>. Our
            primary goal is to collaborate, innovate, and prepare the
            campus&apos;s best talents to compete in various{" "}
            <strong>National</strong> and <strong>International</strong> scale
            competitions.
          </p>
          <ul className="space-y-4 text-gray-700 py-4">
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">
                <Trophy size={20} />
              </span>
              <span>
                <strong>Champion Mindset:</strong> Preparing members to win
                prestigious competitions and bring honor to our alma mater.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">
                <Users size={20} />
              </span>
              <span>
                <strong>Cross-Faculty Collaboration:</strong> Uniting expertise
                from various disciplines at Unklab to create impactful
                solutions.
              </span>
            </li>
          </ul>
          <div>
            <Button variant="primary" size="lg">
              View Our Achievements
            </Button>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-2.webp"
                alt="Uvics team collaboration"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-5.webp"
                alt="Uvics project"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-1.webp"
                alt="Uvics meeting"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
              />
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-10.webp"
                alt="Uvics event"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-100 rounded-full blur-[100px] opacity-50" />
        </div>
      </div>
    </section>
  );
}
