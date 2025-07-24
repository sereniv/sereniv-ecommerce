"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to detect user agent information
 * @returns Object containing user agent detection flags
 */
export function useUserAgent() {
  const [userAgent, setUserAgent] = useState({
    isWindows: false,
    isMac: false,
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: false,
    browser: '',
  });

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    setUserAgent({
      isWindows: ua.includes('windows'),
      isMac: ua.includes('macintosh') || ua.includes('mac os'),
      isIOS: /iphone|ipad|ipod/.test(ua),
      isAndroid: ua.includes('android'),
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua),
      isDesktop: !/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua),
      browser: getBrowser(ua),
    });
  }, []);

  return userAgent;
}

/**
 * Helper function to determine browser type
 */
function getBrowser(ua: string): string {
  if (ua.includes('edge') || ua.includes('edg')) return 'edge';
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'opera';
  return 'unknown';
}
