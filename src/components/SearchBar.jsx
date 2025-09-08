import React from 'react'

const SearchBar = ({ value, onChange, onKeyPress, placeholder }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
      />
    </div>
  )
}

export default SearchBar
