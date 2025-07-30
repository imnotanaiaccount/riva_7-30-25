import '../styles/globals.css';
import Head from 'next/head';
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export const SupabaseContext = createContext();

function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Store the subscription object
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Cleanup function
    return () => {
      // Check if subscription exists and has an unsubscribe method
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Primary Meta Tags */}
        <title>Riva - Modern Digital Solutions for Business Growth</title>
        <meta name="description" content="Riva delivers high-converting websites and digital solutions that drive real business results. Get more leads, increase sales, and grow your brand with our proven approach." />
        <meta property="og:title" content="Riva - Modern Digital Solutions for Business Growth" />
        <meta property="og:description" content="Riva delivers high-converting websites and digital solutions that drive real business results. Get more leads, increase sales, and grow your brand." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://riva.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Riva - Modern Digital Solutions for Business Growth" />
        <meta name="twitter:description" content="Riva delivers high-converting websites and digital solutions that drive real business results. Get more leads, increase sales, and grow your brand." />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href="https://riva.com/" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://riva.com/" />
        <meta property="og:title" content="Riva - Modern Digital Solutions for Business Growth" />
        <meta property="og:description" content="Riva delivers high-converting websites and digital solutions that drive real business results. Get more leads, increase sales, and grow your brand." />
        <meta property="og:image" content="https://riva.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Riva" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://riva.com/" />
        <meta property="twitter:title" content="Riva - Modern Digital Solutions for Business Growth" />
        <meta property="twitter:description" content="Riva delivers high-converting websites and digital solutions that drive real business results. Get more leads, increase sales, and grow your brand." />
        <meta property="twitter:image" content="https://riva.com/og-image.png" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Joshua Hawley",
              "jobTitle": "Founder",
              "worksFor": {
                "@type": "Organization",
                "name": "Riva"
              },
              "description": "Elevating businesses with modern, high-conversion digital solutions",
              "url": "https://riva.com",
              "sameAs": [
                "https://linkedin.com/in/joshua-hawley",
                "https://github.com/joshua-hawley"
              ],
              "knowsAbout": [
                "Web Development",
                "Mobile App Development", 
                "Digital Marketing",
                "Cloud Solutions",
                "UI/UX Design"
              ]
            })
          }}
        />
        {/* Chatbase AI Chatbot */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="5OY5Ttn-LGG3wshshm4Fk";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`
          }}
        />
      </Head>
      <SupabaseProvider>
        <Component {...pageProps} />
      </SupabaseProvider>
    </>
  );
} 