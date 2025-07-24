import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type TabType = 'all' | 'ongoing' | 'upcoming' | 'ended';

interface NavigationState {
  activeTab: TabType;
  currentPageName: string;
  currentPath: string;
}

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const getInitialState = (): NavigationState => {
    if (!pathname) {
      return { activeTab: 'all', currentPageName: 'News', currentPath: '/' };
    }

    if (pathname.includes('/news')) {
      return { activeTab: 'all', currentPageName: 'News', currentPath: pathname };
    }
    
    return { activeTab: 'all', currentPageName: 'News', currentPath: pathname };
  };
  
  const [state, setState] = useState<NavigationState>(getInitialState());
  
  useEffect(() => {
    setState(getInitialState());
  }, [pathname]);
  
  const handleTabChange = (tab: TabType) => {
    if (
      (tab === 'all' && pathname && pathname.includes('/news'))
    ) {
      return;
    }
    
    if (tab === 'all') {
      router.push('/news');
    }
  };
  
  return {
    activeTab: state.activeTab,
    currentPageName: state.currentPageName,
    handleTabChange
  };
} 