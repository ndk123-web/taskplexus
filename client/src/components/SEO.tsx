import React from 'react';
import { Helmet } from 'react-helmet-async';

const HelmetAny = Helmet as any;

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  name?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = 'todo list, productivity, task management, ai planner, goals',
  name = 'TaskPlexus', 
  type = 'website' 
}) => {
  return (
    <HelmetAny>
      {/* Standard metadata tags */}
      <title>{title} | TaskPlexus</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </HelmetAny>
  );
};

export default SEO;
