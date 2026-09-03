import sys

file_path = r'c:\MY FOLDER\LIVE PROJECT\saas-landing-template\app\template\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
seen_imports = set()

for line in lines:
    if line.startswith('import '):
        if line in seen_imports:
            continue
        seen_imports.add(line)
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Duplicates removed")
