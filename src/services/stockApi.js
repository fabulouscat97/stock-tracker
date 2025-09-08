import axios from 'axios'

// 使用Alpha Vantage API
const ALPHA_VANTAGE_API_KEY = 'ERAN9SSKVIUHV0SL'

// 获取多个股票的实时报价
export const getStockData = async (symbols) => {
  try {
    // 首先尝试Yahoo Finance API (无限制)
    const yahooResult = await tryYahooFinanceAPI(symbols)
    if (yahooResult && yahooResult.length > 0) {
      return yahooResult
    }
    
    // 如果Yahoo Finance失败，尝试FMP API
    const fmpResult = await tryFMPAPI(symbols)
    if (fmpResult && fmpResult.length > 0) {
      return fmpResult
    }
    
    // 如果FMP失败，使用Alpha Vantage (有每日限制)
    const alphaResult = await tryAlphaVantageAPI(symbols)
    if (alphaResult && alphaResult.length > 0) {
      return alphaResult
    }
    
    // 如果都失败，返回模拟数据
    return getFallbackData(symbols)
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return getFallbackData(symbols)
  }
}

// 尝试FMP API
const tryFMPAPI = async (symbols) => {
  try {
    const FMP_API_KEY = 'qUAe8Z4wLEmNuI6mqFDPmS6EpJ2P9m5M'
    const symbolsString = symbols.join(',')
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${FMP_API_KEY}`
    )
    
    if (response.data && !response.data['Error Message']) {
      return response.data.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: Number(stock.price?.toFixed(2) || 0),
        change: Number(stock.change?.toFixed(2) || 0),
        changePercent: Number(stock.changesPercentage?.toFixed(2) || 0)
      }))
    }
    return null
  } catch (error) {
    console.log('FMP API failed, trying alternative...')
    return null
  }
}

// 尝试Alpha Vantage API
const tryAlphaVantageAPI = async (symbols) => {
  try {
    const results = []
    
    // Alpha Vantage需要逐个获取股票数据
    for (const symbol of symbols) {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        )
        
        const quote = response.data['Global Quote']
        if (quote && quote['01. symbol']) {
          results.push({
            symbol: quote['01. symbol'],
            name: getCompanyName(symbol),
            price: Number(parseFloat(quote['05. price']).toFixed(2)),
            change: Number(parseFloat(quote['09. change']).toFixed(2)),
            changePercent: Number(parseFloat(quote['10. change percent'].replace('%', '')).toFixed(2))
          })
        }
      } catch (error) {
        console.log(`Failed to fetch ${symbol} from Alpha Vantage`)
      }
    }
    
    return results
  } catch (error) {
    console.log('Alpha Vantage API failed')
    return null
  }
}

// 尝试Yahoo Finance API (免费，无需注册)
const tryYahooFinanceAPI = async (symbols) => {
  try {
    const results = []
    
    // 使用Yahoo Finance的非官方API
    for (const symbol of symbols) {
      try {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        )
        
        const data = response.data.chart.result[0]
        if (data && data.meta) {
          const meta = data.meta
          const currentPrice = meta.regularMarketPrice
          const previousClose = meta.previousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100
          
          results.push({
            symbol: symbol,
            name: getCompanyName(symbol),
            price: Number(currentPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2))
          })
        }
      } catch (error) {
        console.log(`Failed to fetch ${symbol} from Yahoo Finance`)
      }
    }
    
    return results
  } catch (error) {
    console.log('Yahoo Finance API failed')
    return null
  }
}

// 搜索股票的函数 - 使用简单的符号匹配
export const searchStocks = async (query) => {
  try {
    // 常见的股票符号映射
    const commonStocks = {
      'aapl': { symbol: 'AAPL', name: 'Apple Inc.' },
      'googl': { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      'msft': { symbol: 'MSFT', name: 'Microsoft Corporation' },
      'tsla': { symbol: 'TSLA', name: 'Tesla, Inc.' },
      'amzn': { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
      'nvda': { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      'meta': { symbol: 'META', name: 'Meta Platforms, Inc.' },
      'nflx': { symbol: 'NFLX', name: 'Netflix, Inc.' },
      'amd': { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.' },
      'intc': { symbol: 'INTC', name: 'Intel Corporation' },
      'orcl': { symbol: 'ORCL', name: 'Oracle Corporation' },
      'adbe': { symbol: 'ADBE', name: 'Adobe Inc.' },
      'crm': { symbol: 'CRM', name: 'Salesforce, Inc.' },
      'pypl': { symbol: 'PYPL', name: 'PayPal Holdings, Inc.' },
      'uber': { symbol: 'UBER', name: 'Uber Technologies, Inc.' },
      'lyft': { symbol: 'LYFT', name: 'Lyft, Inc.' },
      'zoom': { symbol: 'ZM', name: 'Zoom Video Communications, Inc.' },
      'shop': { symbol: 'SHOP', name: 'Shopify Inc.' },
      'sq': { symbol: 'SQ', name: 'Block, Inc.' },
      'twtr': { symbol: 'TWTR', name: 'Twitter, Inc.' }
    }
    
    const queryLower = query.toLowerCase()
    const results = []
    
    // 精确匹配
    if (commonStocks[queryLower]) {
      results.push(commonStocks[queryLower])
    }
    
    // 部分匹配
    Object.entries(commonStocks).forEach(([key, value]) => {
      if (key.includes(queryLower) && key !== queryLower) {
        results.push(value)
      }
    })
    
    return results.slice(0, 10) // 限制结果数量
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}

// 获取历史价格数据（用于趋势图）
export const getHistoricalData = async (symbol, period = '1year') => {
  try {
    const response = await axios.get(
      `${FMP_BASE_URL}/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`
    )
    
    const historicalData = response.data.historical
    if (!historicalData || historicalData.length === 0) {
      return []
    }
    
    // 取最近一年的数据，每周一个点
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const filteredData = historicalData
      .filter(item => new Date(item.date) >= oneYearAgo)
      .reverse() // 从旧到新排序
      .filter((_, index) => index % 7 === 0) // 每7天取一个点
      .map(item => ({
        date: item.date,
        price: Number(item.close.toFixed(2))
      }))
    
    return filteredData
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}

// 获取公司名称
const getCompanyName = (symbol) => {
  const companyNames = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'TSLA': 'Tesla, Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'NVDA': 'NVIDIA Corporation'
  }
  return companyNames[symbol] || symbol
}

// 备用数据（当API调用失败时使用）
const getFallbackData = (symbols) => {
  const fallbackStocks = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24 },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.52, change: -15.23, changePercent: -0.53 },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 5.42, changePercent: 1.45 },
    'TSLA': { symbol: 'TSLA', name: 'Tesla, Inc.', price: 248.50, change: -3.25, changePercent: -1.29 },
    'AMZN': { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 145.86, change: 1.23, changePercent: 0.85 },
    'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 465.23, change: 12.45, changePercent: 2.75 }
  }
  
  return symbols.map(symbol => fallbackStocks[symbol]).filter(Boolean)
}
