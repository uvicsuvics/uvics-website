import SphereImageGrid from "@/components/ui/SphereImageGrid";

const validImageFiles = [
    "foto-1.webp", "foto-2.webp", "foto-3.webp", "foto-4.webp", 
    "foto-5.webp", "foto-7.webp", "foto-8.webp", "foto-9.webp", 
    "foto-10.webp", "foto-11.webp", "foto-12.webp", "foto-13.webp", 
    "foto-14.webp", "foto15.webp", "foto-16.webp", "foto-17.webp"
];

// Duplicate the images to create a dense sphere (e.g., 48 images)
const images = Array.from({ length: 48 }, (_, i) => {
    const fileName = validImageFiles[i % validImageFiles.length];
    return {
        id: `gallery-img-${i + 1}`,
        src: `/images/img/${fileName}`,
        alt: `UVICS Activity ${i + 1}`,
        title: `UVICS Activity ${i + 1}`,
        description: "Documentation of our latest events and activities at Unklab Virtue In Computer Science.",
    };
});

export function GallerySection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Our Memorable <span className="text-primary">Moments</span>
                    </h2>
                    <p className="text-lg text-gray-500">
                        Explore the vibrant community, intensive workshops, and victorious moments that shape the journey of every UVICS member.
                    </p>
                </div>

                <div className="flex justify-center items-center w-full min-h-[600px]">
                    <SphereImageGrid 
                        images={images} 
                        containerSize={700}
                        sphereRadius={280}
                        autoRotate={true}
                        autoRotateSpeed={0.15}
                        baseImageScale={0.15}
                        hoverScale={1.3}
                    />
                </div>
            </div>
        </section>
    );
}
