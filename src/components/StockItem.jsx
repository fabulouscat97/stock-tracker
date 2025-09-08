import React from 'react'
import StockChart from './StockChart'
import SimpleChart from './SimpleChart'
import { X } from 'lucide-react'

const StockItem = ({ stock, onRemove }) => {
  const isPositive = stock.change >= 0
  const changeClass = isPositive ? 'positive' : 'negative'
  const changePrefix = isPositive ? '+' : ''

  return (
    <div className="stock-item" style={{ position: 'relative' }}>
      <div className="stock-info">
        <div className="stock-symbol">{stock.symbol}</div>
        <div className="stock-name">{stock.name}</div>
      </div>
      
      <SimpleChart 
        symbol={stock.symbol}
        isPositive={isPositive}
      />
      
      <div className="stock-price-info">
        <div className="stock-price">${stock.price}</div>
        <div className={`stock-change ${changeClass}`}>
          {changePrefix}{stock.changePercent}%
        </div>
      </div>
      
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(220, 53, 69, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#dc3545'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(220, 53, 69, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(220, 53, 69, 0.1)'}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

export default StockItem
