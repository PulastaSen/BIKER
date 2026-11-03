import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SupportedLanguage = 'en' | 'hi';

interface AccessibilityContextType {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  voiceEnabled: boolean;
  toggleVoice: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultText: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Plain English & Verified Hindi translations for emergency & critical rider guidance
const DICTIONARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'home.emergency_sos': 'Emergency SOS',
    'home.sos_subtitle': 'Press and hold for 2 seconds to alert nearby helpers',
    'home.bike_help': 'Get help with your bike',
    'home.bike_help_sub': 'Flat tyre, won\'t start, chain issue, or breakdown',
    'home.medical_help': 'Medical emergency',
    'home.medical_help_sub': 'Call ambulance 112, find hospitals, share location',
    'home.safety_help': 'Personal safety',
    'home.safety_help_sub': 'Feeling unsafe, report danger, alert trusted contacts',
    'home.nearby_services': 'Nearby repair & petrol',
    'home.nearby_services_sub': 'Find mechanics, puncture shops, and fuel stations',
    'home.my_bike': 'My garage & bikes',
    'home.my_bike_sub': 'View bike details and service history',
    'home.ride_plan': 'Plan a safe ride',
    'home.ride_plan_sub': 'Share route with family, safety timers, and offline stops',
    'emergency.call_112': 'Call National Emergency 112',
    'location.allow': 'Allow location so we can find where you are',
    'contacts.add': 'Add someone we can call in an emergency',
    'simple_mode.active': 'Simple View Active (Easy to Read)',
    'simple_mode.toggle': 'Simple View',
    'voice.toggle': 'Voice Guide'
  },
  hi: {
    'home.emergency_sos': 'आपातकालीन मदद (SOS)',
    'home.sos_subtitle': 'मदद के लिए 2 सेकंड दबाकर रखें',
    'home.bike_help': 'बाइक में खराबी / रिपेयर',
    'home.bike_help_sub': 'पंक्चर, स्टार्ट न होना, चेन टूटना या टोइंग',
    'home.medical_help': 'चिकित्सा / मेडिकल मदद',
    'home.medical_help_sub': '112 एम्बुलेंस, नजदीकी अस्पताल, लोकेशन शेयर करें',
    'home.safety_help': 'व्यक्तिगत सुरक्षा',
    'home.safety_help_sub': 'असुरक्षित महसूस करना, तुरंत पुलिस या परिवार को सूचना',
    'home.nearby_services': 'नजदीकी मिस्त्री और पेट्रोल',
    'home.nearby_services_sub': 'मैकेनिक, पंक्चर दुकान, पेट्रोल पंप ढूंढें',
    'home.my_bike': 'मेरी बाइक / गैराज',
    'home.my_bike_sub': 'बाइक की जानकारी और सर्विस रिकॉर्ड',
    'home.ride_plan': 'सुरक्षित यात्रा / सेफ राइड',
    'home.ride_plan_sub': 'परिवार के साथ लाइव लोकेशन और चेक-इन',
    'emergency.call_112': '112 पर तुरंत कॉल करें',
    'location.allow': 'लोकेशन चालू करें ताकि हम आप तक पहुँच सकें',
    'contacts.add': 'आपातकालीन संपर्क (परिवार/दोस्त) जोड़ें',
    'simple_mode.active': 'सरल दृश्य सक्रिय (आसान भाषा)',
    'simple_mode.toggle': 'सरल दृश्य',
    'voice.toggle': 'आवाज़ से निर्देश'
  }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('motoassist_simple_mode') === 'true';
  });

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('motoassist_voice_guidance') === 'true';
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('motoassist_language') as SupportedLanguage) || 'en';
  });

  const toggleSimpleMode = useCallback(() => {
    setIsSimpleMode((prev) => {
      const next = !prev;
      localStorage.setItem('motoassist_simple_mode', String(next));
      return next;
    });
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('motoassist_voice_guidance', String(next));
      if (next && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('Voice guidance enabled.');
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      }
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('motoassist_language', lang);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis graceful fallback
    }
  }, [voiceEnabled, language]);

  const t = useCallback((key: string, defaultText: string): string => {
    return DICTIONARY[language]?.[key] || defaultText;
  }, [language]);

  // Clean up any ongoing speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        isSimpleMode,
        toggleSimpleMode,
        voiceEnabled,
        toggleVoice,
        speak,
        stopSpeaking,
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
