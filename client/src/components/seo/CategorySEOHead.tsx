import { Helmet } from 'react-helmet-async';
import { tools } from '@/data/tools';

interface CategorySEOHeadProps {
  category: 'finance' | 'text' | 'health';
  title: string;
  description: string;
}

export function CategorySEOHead({ category, title, description }: CategorySEOHeadProps) {
  const baseUrl = 'https://dapsiwow.com';
  const categoryUrl = `${baseUrl}/${category}-tools`;
  const categoryTools = tools.filter(t => t.category === category);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryUrl}#collection`,
        "url": categoryUrl,
        "name": title,
        "description": description,
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "breadcrumb": { "@id": `${categoryUrl}#breadcrumb` },
        "numberOfItems": categoryTools.length,
        "itemListElement": categoryTools.map((tool, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": tool.name,
            "url": `${baseUrl}/tools/${tool.id}`,
            "description": tool.description,
            "applicationCategory": category === 'finance' ? 'FinanceApplication' : 
                                   category === 'health' ? 'HealthApplication' : 'UtilitiesApplication',
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${categoryUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category.charAt(0).toUpperCase() + category.slice(1) + " Tools",
            "item": categoryUrl
          }
        ]
      }
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={categoryUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={categoryUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json">
        {JSON.stringify(collectionSchema)}
      </script>
    </Helmet>
  );
}
