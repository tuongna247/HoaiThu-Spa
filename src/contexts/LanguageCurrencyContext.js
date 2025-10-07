'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Exchange rate - in practice, this should come from an API
const USD_TO_VND_RATE = 24000; // Approximate rate, should be updated from API

const LanguageCurrencyContext = createContext();

export const useLanguageCurrency = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) {
    throw new Error('useLanguageCurrency must be used within a LanguageCurrencyProvider');
  }
  return context;
};

export const LanguageCurrencyProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currency, setCurrency] = useState('VND');
  const [exchangeRate, setExchangeRate] = useState(USD_TO_VND_RATE);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'vi';
    const savedCurrency = localStorage.getItem('currency') || 'VND';
    
    i18n.changeLanguage(savedLanguage);
    setCurrency(savedCurrency);
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const changeCurrency = (curr) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
  };

  const formatPrice = (priceUSD) => {
    if (currency === 'VND') {
      const priceVND = Math.round(priceUSD * exchangeRate);
      return `${priceVND.toLocaleString('vi-VN')} ₫`;
    } else {
      return `$${priceUSD}`;
    }
  };

  const convertPrice = (priceUSD) => {
    if (currency === 'VND') {
      return Math.round(priceUSD * exchangeRate);
    }
    return priceUSD;
  };

  const getCurrencySymbol = () => {
    return currency === 'VND' ? '₫' : '$';
  };

  const value = {
    language: i18n.language,
    currency,
    exchangeRate,
    changeLanguage,
    changeCurrency,
    formatPrice,
    convertPrice,
    getCurrencySymbol,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    ],
    availableCurrencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    ],
  };

  return (
    <LanguageCurrencyContext.Provider value={value}>
      {children}
    </LanguageCurrencyContext.Provider>
  );
};