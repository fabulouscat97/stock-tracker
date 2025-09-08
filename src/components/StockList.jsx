import React from 'react'
import StockItem from './StockItem'

const StockList = ({ stocks, onRemoveStock }) => {
  if (stocks.length === 0) {
    return (
      <div className="loading">
        No stocks in your watchlist. Search and add some stocks!
      </div>
    )
  }

  return (
    <>
      {stocks.map((stock) => (
        <StockItem 
          key={stock.symbol} 
          stock={stock}
          onRemove={() => onRemoveStock(stock.symbol)}
        />
      ))}
    </>
  )
}

export default StockList
