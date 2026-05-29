import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', fullWidth = true }: Props) {
  return (
    <TextField
      size="small"
      fullWidth={fullWidth}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}
