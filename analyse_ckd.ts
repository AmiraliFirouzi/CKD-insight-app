import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'r_project', 'data', 'kidney_disease.csv');
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split(',');

const data = lines.slice(1).map(line => {
  const values = line.split(',');
  const row: Record<string, string> = {};
  headers.forEach((h, i) => {
    row[h] = values[i];
  });
  return row;
});

console.log('Total records:', data.length);

const classifications = data.map(r => r.classification);
console.log('Classifications:', classifications.reduce((acc, c) => {
  acc[c] = (acc[c] || 0) + 1;
  return acc;
}, {} as Record<string, number>));

// Let's get list of columns
const numericFields = ['age', 'bp', 'bgr', 'bu', 'sc', 'hemo', 'sod', 'pot', 'pcv', 'wc', 'rc', 'al', 'su'];
const factorFields = ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane'];

const results = headers.map(column => {
  const isNumeric = numericFields.includes(column);
  const values = data.map(r => r[column]);
  const missing = values.filter(v => v === '' || v === '?' || v === undefined).length;
  const completeRate = (data.length - missing) / data.length;
  
  if (isNumeric) {
    const validValues = values
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));
    const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
    const variance = validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (validValues.length - 1);
    const sd = Math.sqrt(variance);
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    return {
      name: column,
      type: 'numeric',
      missing,
      completeRate,
      mean,
      sd,
      min,
      max,
      validCount: validValues.length
    };
  } else {
    const levels = Array.from(new Set(values.map(v => v ? v.trim().toLowerCase() : '').filter(Boolean)));
    return {
      name: column,
      type: 'factor',
      missing,
      completeRate,
      levels
    };
  }
});

console.log('--- STATS FOR EACH COLUMN ---');
console.log(JSON.stringify(results, null, 2));

// Group by classification (ckd vs notckd) for distributions
const ckd = data.filter(r => r.classification === 'ckd');
const healthy = data.filter(r => r.classification === 'notckd');

console.log('--- GROUP BY STATS ---');
const groupStats: Record<string, any> = {};
numericFields.forEach(field => {
  const getVals = (subset: typeof data) => subset.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
  const ckdVals = getVals(ckd);
  const healthyVals = getVals(healthy);
  groupStats[field] = {
    ckd: {
      vals: ckdVals,
      mean: ckdVals.reduce((a, b) => a + b, 0) / ckdVals.length,
      min: Math.min(...ckdVals),
      max: Math.max(...ckdVals)
    },
    healthy: {
      vals: healthyVals,
      mean: healthyVals.reduce((a, b) => a + b, 0) / healthyVals.length,
      min: Math.min(...healthyVals),
      max: Math.max(...healthyVals)
    }
  };
});
console.log(JSON.stringify(groupStats, null, 2));
