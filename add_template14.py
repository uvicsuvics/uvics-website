import sys
import re

file_path = r'c:\MY FOLDER\LIVE PROJECT\saas-landing-template\app\template\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if not exists
if 'import Beams from "./template14"' not in content:
    content = content.replace('import SphereImageGrid from "./template13";', 'import SphereImageGrid from "./template13";\nimport Beams from "./template14";')

# Add to array if not exists
if 'filename: "template14.tsx"' not in content:
    old_array = '''  {
    id: 13,
    category: "3D Image Grid",
    filename: "template13.tsx",
    Component: () => <SphereImageGrid images={mockImages as any} containerSize={500} sphereRadius={200} autoRotate={true} />,
  }'''
    
    new_array = '''  {
    id: 13,
    category: "3D Image Grid",
    filename: "template13.tsx",
    Component: () => <SphereImageGrid images={mockImages as any} containerSize={500} sphereRadius={200} autoRotate={true} />,
  },
  {
    id: 14,
    category: "3D Beams Background",
    filename: "template14.tsx",
    Component: () => <div className="w-full h-full min-h-[600px]"><Beams /></div>,
  }'''
    content = content.replace(old_array, new_array)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Template14 added successfully")
