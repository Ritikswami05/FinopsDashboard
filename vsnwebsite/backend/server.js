// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// GET advisory data
app.get('/api/advisory', (req, res) => {
  const query = 'SELECT * FROM AdvisorRecommendations';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// GET VM summary
app.get('/api/vm-summary', (req, res) => {
  const query = `
    SELECT 
    ResourceGroup,
    ResourceName,
    OperatingSystem,
    Meter,
    MAX(CurrentCPU) AS CurrentCPU,
    MAX(CurrentMemory) AS CurrentMemory,
    ROUND(AVG(CASE WHEN MetricDate >= CURDATE() - INTERVAL 30 DAY THEN AverageCPU END), 2) AS AvgCPU_1Month,
    ROUND(AVG(CASE WHEN MetricDate >= CURDATE() - INTERVAL 90 DAY THEN AverageCPU END), 2) AS AvgCPU_3Month,
    MAX(CASE WHEN MetricDate >= CURDATE() - INTERVAL 30 DAY THEN MaximumCPU END) AS MaxCPU_1Month,
    MAX(CASE WHEN MetricDate >= CURDATE() - INTERVAL 90 DAY THEN MaximumCPU END) AS MaxCPU_3Month,
    ROUND(AVG(CASE WHEN MetricDate >= CURDATE() - INTERVAL 30 DAY THEN AverageMemory END), 2) AS AvgMemory_1Month,
    ROUND(AVG(CASE WHEN MetricDate >= CURDATE() - INTERVAL 90 DAY THEN AverageMemory END), 2) AS AvgMemory_3Month,
    MAX(CASE WHEN MetricDate >= CURDATE() - INTERVAL 30 DAY THEN MaximumMemory END) AS MaxMemory_1Month,
    MAX(CASE WHEN MetricDate >= CURDATE() - INTERVAL 90 DAY THEN MaximumMemory END) AS MaxMemory_3Month
FROM 
    azure_Consumption
GROUP BY 
    ResourceGroup, ResourceName, OperatingSystem, Meter;


  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing VM summary query', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// GET cost summary
app.get('/api/cost-summary', (req, res) => {
  const query = `
    SELECT 
      ResourceGroup,
      ResourceType,
      ResourceName,
      MeterCategory,
      SUM(cost) AS TotalCost,
      SUM(Total_Hours_of_Execution) AS TotalHours
    FROM AzureCostData
    GROUP BY ResourceGroup, ResourceType, ResourceName, MeterCategory;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing cost summary query', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
