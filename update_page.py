import sys

file_path = r'c:\MY FOLDER\LIVE PROJECT\saas-landing-template\app\template\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

imports = '''import { Hero as Hero7 } from "./template7";
import Footer4Col from "./template10";
import { Blog8 } from "./template11";
import AboutSection1 from "./template12";
import SphereImageGrid from "./template13";'''

content = content.replace('import { Hero as Hero7 } from "./template7";', imports)

old_array = '''  // Placeholders for future templates
  ...Array.from({ length: 1 }).map((_, i) => ({
    id: i + 8,
    category: "Landing Page",
    filename: "",
    Component: null, // No component yet for placeholders
  }))'''

new_array = '''  {
    id: 8,
    category: "Placeholder",
    filename: "template8.tsx",
    Component: null,
  },
  {
    id: 9,
    category: "Navbar",
    filename: "template9.tsx",
    Component: null,
  },
  {
    id: 10,
    category: "Footer",
    filename: "template10.tsx",
    Component: () => <Footer4Col />,
  },
  {
    id: 11,
    category: "Blog Section",
    filename: "template11.tsx",
    Component: () => <Blog8 />,
  },
  {
    id: 12,
    category: "About Section",
    filename: "template12.tsx",
    Component: () => <AboutSection1 />,
  },
  {
    id: 13,
    category: "3D Image Grid",
    filename: "template13.tsx",
    Component: () => <SphereImageGrid images={mockImages as any} containerSize={500} sphereRadius={200} autoRotate={true} />,
  }'''

content = content.replace(old_array, new_array)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated successfully")
