const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'content/posts');

function getAllSlugs() {
  const slugs = [];
  
  const categories = fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const category of categories) {
    const categoryPath = path.join(postsDirectory, category);
    const postFolders = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of postFolders) {
      const mdxPath = path.join(categoryPath, folder, 'index.mdx');
      
      if (fs.existsSync(mdxPath)) {
        const fileContents = fs.readFileSync(mdxPath, 'utf8');
        const { data } = matter(fileContents);
        
        // Slugify the frontmatter slug
        const slug = data.slug 
          ? String(data.slug).toLowerCase().replace(/\s+/g, '-')
          : folder;
        
        slugs.push({
          category,
          folder,
          frontmatterSlug: data.slug || null,
          finalSlug: slug
        });
      }
    }
  }

  return slugs;
}

const slugs = getAllSlugs();
console.log(JSON.stringify(slugs, null, 2));
