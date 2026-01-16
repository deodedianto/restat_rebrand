#!/usr/bin/env python3

import os
import shutil

# Source and destination paths
source_base = "/Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts"
dest_base = "/Users/ddedia1/Documents/GitHub/restat_rebrand/content/posts"

# Categories to copy
categories = [
    "interpretasi-uji-statistik",
    "metode-penelitian", 
    "metode-statistik",
    "software-statistik",
    "tutorial-analisis-statistik"
]

# Copy each category
for category in categories:
    source_cat = os.path.join(source_base, category)
    dest_cat = os.path.join(dest_base, category)
    
    # Create destination if it doesn't exist
    os.makedirs(dest_cat, exist_ok=True)
    
    # Copy all subdirectories from source to destination
    if os.path.exists(source_cat):
        for item in os.listdir(source_cat):
            source_item = os.path.join(source_cat, item)
            dest_item = os.path.join(dest_cat, item)
            
            if os.path.isdir(source_item):
                # Copy entire directory
                if os.path.exists(dest_item):
                    shutil.rmtree(dest_item)
                shutil.copytree(source_item, dest_item)
                print(f"Copied {item} to {category}")

# Count files
mdx_count = 0
image_count = 0

for root, dirs, files in os.walk(dest_base):
    for file in files:
        if file.endswith('.mdx'):
            mdx_count += 1
        elif file.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            image_count += 1

print(f"\nTotal MDX files copied: {mdx_count}")
print(f"Total images copied: {image_count}")
