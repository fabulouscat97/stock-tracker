import React from 'react'
import { AreaChart, Area } from 'recharts'

const StockChart = ({ symbol, data, isPositive }) => {
  // 固定的测试数据
  const chartData = [
    { price: 100 },
    { price: 105 },
    { price: 102 },
    { price: 108 },
    { price: 110 },
    { price: 107 },
    { price: 112 },
    { price: 115 },
    { price: 113 },
    { price: 118 }
  ]
  
  // Google股票风格的颜色
  const lineColor = isPositive ? '#137333' : '#d93025'

  console.log('StockChart rendering for:', symbol, 'Data:', chartData)

  return (
    <div className="stock-chart-container" style={{ border: '1px solid red', background: '#f0f0f0' }}>
      <div style={{ fontSize: '10px', color: 'blue' }}>Chart for {symbol}</div>
      <AreaChart width={200} height={50} data={chartData}>
        <Area
          type="monotone"
          dataKey="price"
          stroke={lineColor}
          strokeWidth={2}
          fill={lineColor}
          fillOpacity={0.3}
        />
      </AreaChart>
    </div>
  )
}

// 生成模拟的一年股价数据
const generateMockYearData = (symbol, isPositive) => {
  const data = []
  const basePrice = getBasePrice(symbol)
  
  // 生成30个数据点
  for (let i = 0; i < 30; i++) {
    // 简单的波动计算
    const variation = isPositive ? 
      basePrice * (0.8 + (i / 30) * 0.4 + Math.random() * 0.1) :
      basePrice * (1.2 - (i / 30) * 0.4 + Math.random() * 0.1)
    
    data.push({
      price: Math.round(variation * 100) / 100
    })
  }
  
  return data
}

// 根据股票符号获取基础价格
const getBasePrice = (symbol) => {
  const basePrices = {
    'AAPL': 150,
    'GOOGL': 2800,
    'MSFT': 350,
    'TSLA': 200,
    'AMZN': 140,
    'NVDA': 400
  }
  return basePrices[symbol] || 100
}

export default StockChart
