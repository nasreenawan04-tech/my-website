import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_IMAGES_DIR = path.join(__dirname, '../public/images/blog');
const QUALITY_WEBP = 85;
const QUALITY_PNG = 90;

const blogImageConfig = [
  {
    url: '/images/blog/online-calculators-2025.png',
    slug: 'online-calculators-2025',
    alt: 'Essential free online calculators including mortgage, loan, BMI, and financial planning tools displayed on modern devices',
    isLocal: true
  },
  {
    url: '/images/blog/financial-calculator-2025.png',
    slug: 'financial-calculator-2025',
    alt: 'Financial calculator tools for budgeting, investments, and money management',
    isLocal: true
  },
  {
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    slug: 'seo-guide-small-business',
    alt: 'Small business owner working on SEO strategy with laptop showing analytics dashboard and search rankings',
    isLocal: false
  },
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    slug: 'productivity-tools-2025',
    alt: 'Modern productivity tools and workspace setup with digital devices, planners, and organizational systems',
    isLocal: false
  },
  {
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    slug: 'financial-planning-guide',
    alt: 'Financial planning workspace with calculator, charts, budget spreadsheets, and investment documents',
    isLocal: false
  },
  {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    slug: 'web-development-trends',
    alt: 'Web developer coding on laptop with multiple screens showing modern web development tools and frameworks',
    isLocal: false
  }
];

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function optimizeImage(inputPath, slug, isLocal) {
  console.log(`\n📸 Processing: ${slug}`);
  
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  console.log(`  Original: ${metadata.format}, ${metadata.width}x${metadata.height}, ${(metadata.size / 1024).toFixed(2)} KB`);
  
  const webpPath = path.join(BLOG_IMAGES_DIR, `${slug}.webp`);
  const pngPath = path.join(BLOG_IMAGES_DIR, `${slug}.png`);
  
  if (isLocal && inputPath === pngPath) {
    const tempPath = path.join(BLOG_IMAGES_DIR, `temp-original-${slug}.png`);
    fs.copyFileSync(inputPath, tempPath);
    inputPath = tempPath;
  }
  
  await sharp(inputPath)
    .resize(1200, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: QUALITY_WEBP, effort: 6 })
    .toFile(webpPath);
  
  const webpStats = fs.statSync(webpPath);
  console.log(`  ✓ WebP: ${(webpStats.size / 1024).toFixed(2)} KB (${((1 - webpStats.size / metadata.size) * 100).toFixed(1)}% reduction)`);
  
  await sharp(inputPath)
    .resize(1200, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png({ quality: QUALITY_PNG, compressionLevel: 9 })
    .toFile(pngPath);
  
  const pngStats = fs.statSync(pngPath);
  console.log(`  ✓ PNG: ${(pngStats.size / 1024).toFixed(2)} KB (fallback)`);
  
  if (isLocal && inputPath.includes('temp-original-')) {
    fs.unlinkSync(inputPath);
  }
  
  const finalMetadata = await sharp(webpPath).metadata();
  
  return {
    slug,
    width: finalMetadata.width,
    height: finalMetadata.height,
    webpSize: webpStats.size,
    pngSize: pngStats.size,
    originalSize: metadata.size
  };
}

async function main() {
  console.log('🚀 Starting blog image optimization...\n');
  
  ensureDirectoryExists(BLOG_IMAGES_DIR);
  
  const results = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const config of blogImageConfig) {
    try {
      let inputPath;
      
      if (config.isLocal) {
        inputPath = path.join(__dirname, '..', 'public', config.url);
        
        if (!fs.existsSync(inputPath)) {
          console.log(`⚠️  Skipping ${config.slug}: File not found at ${inputPath}`);
          continue;
        }
      } else {
        const tempPath = path.join(BLOG_IMAGES_DIR, `temp-${config.slug}.jpg`);
        console.log(`⬇️  Downloading: ${config.slug}`);
        await downloadImage(config.url, tempPath);
        inputPath = tempPath;
      }
      
      const result = await optimizeImage(inputPath, config.slug, config.isLocal);
      result.alt = config.alt;
      results.push(result);
      
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.webpSize;
      
      if (!config.isLocal) {
        const tempPath = path.join(BLOG_IMAGES_DIR, `temp-${config.slug}.jpg`);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${config.slug}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images processed: ${results.length}`);
  console.log(`Original total size: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
  console.log(`Optimized total size (WebP): ${(totalOptimizedSize / 1024).toFixed(2)} KB`);
  console.log(`Total size reduction: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  console.log('\n📝 Image metadata for blogData.ts update:\n');
  results.forEach(result => {
    console.log(`{
  slug: "${result.slug}",
  image: "/images/blog/${result.slug}.webp",
  imageFallback: "/images/blog/${result.slug}.png",
  alt: "${result.alt}",
  width: ${result.width},
  height: ${result.height}
},`);
  });
  
  const metadataPath = path.join(BLOG_IMAGES_DIR, 'image-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Metadata saved to: ${metadataPath}`);
  
  console.log('\n✨ Blog image optimization complete!');
}

main().catch(console.error);
