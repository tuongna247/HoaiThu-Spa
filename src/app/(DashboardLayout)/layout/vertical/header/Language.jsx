import React, { useContext } from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { CustomizerContext } from '@/app/context/customizerContext';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { MonetizationOn, Language as LanguageIcon } from "@mui/icons-material";

const Languages = [
  {
    flagname: "English",
    icon: "/images/flag/icon-flag-en.svg",
    value: "en",
  },
  {
    flagname: "Tiếng Việt",
    icon: "/images/flag/icon-flag-vn.svg",
    value: "vi",
  },
];

const Currencies = [
  {
    name: "US Dollar",
    code: "USD",
    symbol: "$",
  },
  {
    name: "Vietnamese Dong",
    code: "VND", 
    symbol: "₫",
  },
];

const Language = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = Boolean(anchorEl);
  const { isLanguage, setIsLanguage } = useContext(CustomizerContext);
  const { 
    language, 
    currency, 
    changeLanguage, 
    changeCurrency, 
    availableLanguages, 
    availableCurrencies 
  } = useLanguageCurrency();

  const currentLang =
    Languages.find((_lang) => _lang.value === language) ||
    Languages[0];
  
  const currentCurrency = 
    Currencies.find((_curr) => _curr.code === currency) ||
    Currencies[0];
    
  const { i18n } = useTranslation();
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (langValue) => {
    changeLanguage(langValue);
    setIsLanguage(langValue);
    handleClose();
  };
  
  const handleCurrencyChange = (currencyCode) => {
    changeCurrency(currencyCode);
    handleClose();
  };
  
  useEffect(() => {
    i18n.changeLanguage(isLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          aria-label="language and currency"
          id="lang-currency-button"
          aria-controls={open ? "lang-currency-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Avatar
              src={currentLang.icon}
              alt={currentLang.value}
              sx={{ width: 20, height: 20 }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {currentCurrency.symbol}
            </Typography>
          </Stack>
        </IconButton>
      </Box>
      
      <Menu
        id="lang-currency-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiMenu-paper": {
            width: "280px",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LanguageIcon fontSize="small" />
            Language
          </Typography>
        </Box>
        {Languages.map((option, index) => (
          <MenuItem
            key={`lang-${index}`}
            sx={{ py: 1, px: 3 }}
            onClick={() => handleLanguageChange(option.value)}
            selected={language === option.value}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={option.icon}
                alt={option.icon}
                sx={{ width: 20, height: 20 }}
              />
              <Typography>{option.flagname}</Typography>
            </Stack>
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MonetizationOn fontSize="small" />
            Currency
          </Typography>
        </Box>
        {Currencies.map((option, index) => (
          <MenuItem
            key={`curr-${index}`}
            sx={{ py: 1, px: 3 }}
            onClick={() => handleCurrencyChange(option.code)}
            selected={currency === option.code}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ minWidth: 20, textAlign: 'center' }}>
                {option.symbol}
              </Typography>
              <Typography>{option.name} ({option.code})</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Language;
