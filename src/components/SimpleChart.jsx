import React, { useState, useEffect } from 'react'
import { getHistoricalData } from '../services/stockApi'

const SimpleChart = ({ symbol, isPositive }) => {
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true)
        const data = await getHistoricalData(symbol)
        setHistoricalData(data)
      } catch (error) {
        console.error('Error fetching historical data:', error)
        // 如果获取失败，使用生成的模拟数据
        setHistoricalData([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [symbol])
  // 生成SVG路径数据
  const generatePath = () => {
    const width = 200
    const height = 50
    let dataToUse = historicalData
    
    // 如果没有历史数据或数据为空，生成模拟数据
    if (!dataToUse || dataToUse.length === 0) {
      const numPoints = 20
      const points = []
      
      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width
        let y
        
        if (isPositive) {
          // 上涨趋势
          y = height - (height * 0.3) - Math.sin(i * 0.5) * 10 - (i * 0.5)
        } else {
          // 下跌趋势
          y = (height * 0.7) + Math.sin(i * 0.5) * 10 + (i * 0.5)
        }
        
        points.push(`${x},${Math.max(5, Math.min(height - 5, y))}`)
      }
      
      return `M ${points.join(' L ')}`
    }
    
    // 使用真实历史数据
    const prices = dataToUse.map(item => item.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    
    const points = dataToUse.map((item, index) => {
      const x = (index / (dataToUse.length - 1)) * width
      const normalizedPrice = priceRange > 0 ? (item.price - minPrice) / priceRange : 0.5
      const y = height - (normalizedPrice * (height - 10)) - 5 // 留5px边距
      
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  const lineColor = isPositive ? '#137333' : '#d93025'
  const path = generatePath()

  if (loading) {
    return (
      <div className="stock-chart-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '10px', 
        color: '#666' 
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div className="stock-chart-container">
      <svg width="100%" height="100%" viewBox="0 0 200 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`simple-gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={lineColor} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* 填充区域 */}
        <path
          d={`${path} L 200,50 L 0,50 Z`}
          fill={`url(#simple-gradient-${symbol})`}
        />
        
        {/* 线条 */}
        <path
          d={path}
          stroke={lineColor}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  )
}

export default SimpleChart
