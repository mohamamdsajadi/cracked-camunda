/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fa from './locales/fa.json';

export type SelectionOption = {
  id: string;
  label: string;
};

type TranslationDictionary = Record<string, string>;

type LocaleConfig = {
  language: string;
  translationFile: TranslationDictionary;
};

interface LocaleDefinitions {
  [key: string]: LocaleConfig;
}

const localeDefinitions: LocaleDefinitions = {
  en: {language: 'English', translationFile: en},
  fr: {language: 'Français', translationFile: fr},
  de: {language: 'Deutsch', translationFile: de},
  es: {language: 'Español', translationFile: es},
  fa: {language: 'فارسی', translationFile: fa},
};

const defaultLanguage = 'en';

const languageItems: SelectionOption[] = Object.keys(localeDefinitions).map(
  (key) => ({id: key, label: localeDefinitions[key].language}),
);

function getBrowserLanguage(): string {
  const browserLanguage = (navigator.language || defaultLanguage)
    .toLowerCase()
    .split('-')[0];

  return localeDefinitions[browserLanguage] ? browserLanguage : defaultLanguage;
}

function getInitialLanguage(): string {
  const persistedLanguage = localStorage.getItem('language');

  if (persistedLanguage !== null && localeDefinitions[persistedLanguage]) {
    return persistedLanguage;
  }

  return getBrowserLanguage();
}

function getMessage(language: string, key: string): string {
  return (
    localeDefinitions[language]?.translationFile[key] ??
    localeDefinitions[defaultLanguage].translationFile[key] ??
    key
  );
}

type LocalizationContextValue = {
  language: string;
  t: (key: string) => string;
  changeLanguage: (language: string) => void;
};

const localizationContext = createContext<LocalizationContextValue>({
  language: defaultLanguage,
  t: (key: string) => getMessage(defaultLanguage, key),
  changeLanguage: () => {},
});

const LocalizationProvider: FC<{children: ReactNode}> = ({children}) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  const value = useMemo(
    () => ({
      language,
      t: (key: string) => getMessage(language, key),
      changeLanguage: (newLanguage: string) => {
        if (localeDefinitions[newLanguage] === undefined) {
          return;
        }

        localStorage.setItem('language', newLanguage);
        setLanguage(newLanguage);
      },
    }),
    [language],
  );

  return (
    <localizationContext.Provider value={value}>
      {children}
    </localizationContext.Provider>
  );
};

const useLocalization = () => useContext(localizationContext);

export {LocalizationProvider, languageItems, useLocalization};
