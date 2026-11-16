import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import React, { type PropsWithChildren } from 'react';
import { LANDING_CSS } from '../components/landingCss';

// The HTML shell of every page on the web. Pages are rendered to static HTML at build time
// (web.output "static"), so the landing page paints from the HTML itself, without waiting for the
// app's JavaScript, and needs no loading screen. Runs only in Node during the build: no browser APIs.

export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#F2F0EB" />
        <meta name="description" content="Kudoze is Strava for sleep: post your night, give kudos, join sleep challenges with friends." />
        {/* Native-like scrolling: the page scrolls inside its root ScrollView, not the body. */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'html, body { background: #F2F0EB; }' }} />
        {/* The landing page's wide layout, in CSS so the static HTML is right before any JavaScript runs. */}
        <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        <noscript>Kudoze needs JavaScript for the waitlist and the app.</noscript>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
