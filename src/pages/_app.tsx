import "@/styles/globals.scss";
import Layout from "@/components/Layout";
import Head from "next/head";
import Script from "next/script";
import { Toaster, toast } from "sonner";
import "@/styles/checkbox.scss";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import Router from "next/router";
import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "@/styles/nprogress.scss";
import "react-loading-skeleton/dist/skeleton.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import AdSense from "@/components/AdSense";


export default function App({ Component, pageProps }: any) {
  const [isLoading, setIsLoading] = useState(false);
  NProgress.configure({ showSpinner: false });
  const GTag: any = process.env.NEXT_PUBLIC_GT_MEASUREMENT_ID;
 

  return (
    <>
      <Head>
      <AdSense pId="ca-pub-9098691343505810"/>

        <title>Hopcorn</title>
        <meta name="description" content="Your Personal Streaming Oasis" />
        <meta
          name="keywords"
          content="movie, streaming, tv, rive, stream. movie app, tv shows, movie download"
        />
        <meta
          name="google-site-verification"
          content="J0QUeScQSxufPJqGTaszgnI35U2jN98vVWSOkVR4HrI"
        />
        <link rel="manifest" href="manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f4f7fe" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rive" />
        {/* <link rel="icon" type="image/svg+xml" href="/images/logo512.svg" color="#f4f7fe" /> */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* <meta name="msapplication-TileColor" content="#f4f7fe" /> */}
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="shortcut icon" href="/images/logo512.png" />
        <link rel="apple-touch-startup-image" href="/images/logo512.svg" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Rive" />
        <meta
          property="og:description"
          content="Your Personal Streaming Oasis"
        />
        <meta
          property="og:image"
          content="https://rivestream.live/images/MetaImage.jpg"
        />
        <meta property="og:url" content="https://rivestream.live" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Rive" />

        {/* Twitter Card Meta Tags */}
        <meta
          name="twitter:card"
          content="https://rivestream.live/images/MetaImage.jpg"
        />
        <meta property="twitter:domain" content="rivestream.live" />
        <meta property="twitter:url" content="https://rivestream.live" />
        <meta name="twitter:title" content="Rive" />
        <meta
          name="twitter:description"
          content="Your Personal Streaming Oasis"
        />
        <meta
          name="twitter:image"
          content="https://rivestream.live/images/MetaImage.jpg"
        />
<script defer src="https://cloud.umami.is/script.js" data-website-id="ed6f84c1-0813-4741-89c5-03108615fecf"></script>

      </Head> 
      <Layout>
        <Toaster
          toastOptions={{
            className: "sooner-toast-desktop",
          }}
          position="bottom-right"
          expand={true}
        />
        <Toaster
          toastOptions={{
            className: "sooner-toast-mobile",
          }}
          position="top-center"
        />
        <Tooltip id="tooltip" className="react-tooltip" />

        <Component {...pageProps} />
      </Layout>
      <GoogleAnalytics gaId={GTag} />
    
   
    </>
  );
}
