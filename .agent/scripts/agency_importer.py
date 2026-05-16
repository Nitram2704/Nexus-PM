import os
import re
import yaml

# Configuration
REPO_ROOT = "/tmp/agency-agents-repo"
OUTPUT_DIR = "c:/Users/marti/Visual/Nexus PM/.agent/agents/agency"
DIVISIONS = ["engineering", "design", "product", "testing", "strategy", "specialized"]

def slugify(name):
    return re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')

def convert_agent(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract frontmatter
    fm_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL | re.MULTILINE)
    if not fm_match:
        return None

    fm_content = fm_match.group(1)
    body = content[fm_match.end():].strip()

    try:
        fm = yaml.safe_load(fm_content)
        if not isinstance(fm, dict):
            return None
    except yaml.YAMLError:
        return None

    name = fm.get('name', 'Unknown Agent')
    description = fm.get('description', '')
    
    # Antigravity format
    new_fm = {
        'name': f"agency-{slugify(name)}",
        'description': description,
        'tools': ['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write'],
        'model': 'inherit',
        'skills': ['clean-code']
    }
    
    # Custom attributes from agency repo
    if 'color' in fm: new_fm['color'] = fm['color']
    if 'emoji' in fm: new_fm['emoji'] = fm['emoji']

    new_fm_str = yaml.dump(new_fm, sort_keys=False)
    
    return f"---\n{new_fm_str}---\n\n{body}"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    count = 0
    
    for division in DIVISIONS:
        div_path = os.path.join(REPO_ROOT, division)
        if not os.path.exists(div_path):
            continue
            
        for filename in os.listdir(div_path):
            if filename.endswith(".md"):
                file_path = os.path.join(div_path, filename)
                converted = convert_agent(file_path)
                
                if converted:
                    slug = slugify(filename.replace(".md", ""))
                    if not slug.startswith("agency-"):
                        slug = f"agency-{slug}"
                        
                    output_path = os.path.join(OUTPUT_DIR, f"{slug}.md")
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(converted)
                    count += 1
                    print(f"Converted: {slug}")

    print(f"\nTotal agents converted: {count}")

if __name__ == "__main__":
    main()
