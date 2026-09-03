import sys

file_path = r'c:\MY FOLDER\LIVE PROJECT\saas-landing-template\app\template\template14.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import './Beams.css';", "")
content = content.replace('className="beams-container"', 'className="absolute inset-0 w-full h-full"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed template14.tsx styling and imports")
