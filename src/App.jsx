import React, { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import StockList from './components/StockList'
import SearchBar from './components/SearchBar'
import { getStockData, searchStocks } from './services/stockApi'

function App() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // 默认关注的股票列表
  const defaultStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA']

  useEffect(() => {
    loadStockData()
  }, [])

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchResults])

  const loadStockData = async () => {
    try {
      setLoading(true)
      const stockData = await getStockData(defaultStocks)
      setStocks(stockData)
      setError(null)
    } catch (err) {
      setError('Unable to load stock data. Please check your network connection.')
      console.error('Error loading stock data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (query.length < 1) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const results = await searchStocks(query)
      
      // 如果搜索没有结果，但输入看起来像股票符号，提供直接添加选项
      if (results.length === 0 && query.length >= 1 && query.length <= 5) {
        const upperQuery = query.toUpperCase()
        results.push({
          symbol: upperQuery,
          name: `Add ${upperQuery} directly`
        })
      }
      
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const addStock = async (symbol) => {
    try {
      setLoading(true)
      const newStockData = await getStockData([symbol])
      if (newStockData && newStockData.length > 0) {
        setStocks(prevStocks => {
          // 检查是否已经存在
          const exists = prevStocks.some(stock => stock.symbol === symbol)
          if (exists) {
            setError(`${symbol} is already in your watchlist`)
            return prevStocks
          }
          return [...prevStocks, ...newStockData]
        })
        setSearchQuery('')
        setShowSearchResults(false)
        setSearchResults([])
        setError(null) // 清除之前的错误
      } else {
        setError(`Failed to get data for ${symbol}. Please check the symbol and try again.`)
      }
    } catch (err) {
      console.error('Error adding stock:', err)
      setError(`Failed to add ${symbol}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault()
      addStock(searchQuery.trim().toUpperCase())
    }
  }

  const removeStock = (symbol) => {
    setStocks(prevStocks => prevStocks.filter(stock => stock.symbol !== symbol))
  }

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Stock Tracker</h1>
            <p className="subtitle">Real-time Stock Prices & Trends</p>
          </div>
          <button 
            onClick={loadStockData}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div style={{ position: 'relative' }} className="search-container">
        <SearchBar 
          value={searchQuery}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          placeholder="Search stocks to add... (or type symbol and press Enter)"
        />
        
        {showSearchResults && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {isSearching ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => addStock(result.symbol)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{result.symbol}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{result.name}</div>
                  </div>
                  <Plus size={16} color="#007bff" />
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                No stocks found
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="stock-list">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <StockList 
            stocks={stocks}
            onRemoveStock={removeStock}
          />
        )}
      </div>
    </div>
  )
}

export default App
