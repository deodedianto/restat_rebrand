#!/bin/bash

# Create content directory structure
mkdir -p content/posts/interpretasi-uji-statistik
mkdir -p content/posts/metode-penelitian
mkdir -p content/posts/metode-statistik
mkdir -p content/posts/software-statistik
mkdir -p content/posts/tutorial-analisis-statistik

# Copy all blog posts
cp -r /Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts/interpretasi-uji-statistik/* content/posts/interpretasi-uji-statistik/
cp -r /Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts/metode-penelitian/* content/posts/metode-penelitian/
cp -r /Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts/metode-statistik/* content/posts/metode-statistik/
cp -r /Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts/software-statistik/* content/posts/software-statistik/
cp -r /Users/ddedia1/Documents/GitHub/restatblog/blog/content/posts/tutorial-analisis-statistik/* content/posts/tutorial-analisis-statistik/

# Count files
echo "MDX files copied:"
find content/posts -name "index.mdx" | wc -l

echo "All images copied:"
find content/posts -name "*.png" -o -name "*.jpg" -o -name "*.webp" | wc -l
