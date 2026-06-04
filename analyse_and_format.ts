import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'r_project', 'data', 'kidney_disease.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split(',');

const rawData = lines.slice(1).map(line => {
  const values = line.split(',');
  const row: Record<string, string> = {};
  headers.forEach((h, i) => {
    row[h] = values[i];
  });
  return row;
});

// Let's clean the dataset.
// classification: 'ckd' -> 'yes', 'notckd' -> 'no'
// age, bp, bgr, bu, sc, hemo, sod, pot, pcv, wc, rc, al, su are numeric.
// missing values are empty strings, '?', or undefined. Let's convert them to null.
const numericFields = ['age', 'bp', 'bgr', 'bu', 'sc', 'hemo', 'sod', 'pot', 'pcv', 'wc', 'rc', 'al', 'su'];
const factorFields = ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane', 'classification'];

const cleanData = rawData.map(row => {
  const cleanRow: Record<string, any> = {};
  
  // Clean target
  const rawClass = row.classification?.trim().toLowerCase();
  cleanRow.classification = rawClass === 'ckd' ? 'yes' : 'no';

  // Clean numeric
  numericFields.forEach(f => {
    const v = row[f]?.trim();
    if (v === '' || v === '?' || v === undefined || v === null) {
      cleanRow[f] = null;
    } else {
      cleanRow[f] = parseFloat(v);
    }
  });

  // Clean factors
  factorFields.forEach(f => {
    if (f === 'classification') return;
    const v = row[f]?.trim().toLowerCase();
    if (v === '' || v === '?' || v === undefined || v === null) {
      cleanRow[f] = null;
    } else {
      cleanRow[f] = v;
    }
  });

  return cleanRow;
});

// Impute missing values with column means (for numeric) and modes (for factors)
const means: Record<string, number> = {};
numericFields.forEach(f => {
  const vals = cleanData.map(r => r[f]).filter(v => v !== null) as number[];
  means[f] = vals.reduce((a, b) => a + b, 0) / vals.length;
});

const modes: Record<string, string> = {};
factorFields.forEach(f => {
  if (f === 'classification') return;
  const vals = cleanData.map(r => r[f]).filter(v => v !== null) as string[];
  const counts = vals.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  let mode = 'no';
  let maxCount = 0;
  Object.keys(counts).forEach(k => {
    if (counts[k] > maxCount) {
      maxCount = counts[k];
      mode = k;
    }
  });
  modes[f] = mode;
});

// Create fully imputed dataset
const imputedData = cleanData.map(row => {
  const impRow = { ...row };
  numericFields.forEach(f => {
    if (impRow[f] === null) impRow[f] = means[f];
  });
  factorFields.forEach(f => {
    if (f === 'classification') return;
    if (impRow[f] === null) impRow[f] = modes[f];
  });
  return impRow;
});

// 1. DATA QUALITY REPORT (CKD_COLUMNS)
const CKD_COLUMNS = headers.map(column => {
  if (column === 'id') return null;
  const isNumeric = numericFields.includes(column);
  
  const rawVals = cleanData.map(r => r[column]);
  const missing = rawVals.filter(v => v === null).length;
  const completeRate = (cleanData.length - missing) / cleanData.length;

  if (isNumeric) {
    const validVals = rawVals.filter(v => v !== null) as number[];
    const mean = validVals.reduce((a, b) => a + b, 0) / validVals.length;
    const variance = validVals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (validVals.length - 1);
    const sd = Math.sqrt(variance);
    return {
      name: column,
      type: 'numeric',
      missing,
      completeRate: parseFloat(completeRate.toFixed(3)),
      mean: parseFloat(mean.toFixed(2)),
      sd: parseFloat(sd.toFixed(2))
    };
  } else {
    const validVals = rawVals.filter(v => v !== null) as string[];
    const levels = Array.from(new Set(validVals));
    return {
      name: column,
      type: 'factor',
      missing,
      completeRate: parseFloat(completeRate.toFixed(3)),
      levels
    };
  }
}).filter(Boolean);

// 2. MISSING VALUES PER VARIABLE
const MISSING_DATA = headers
  .map(column => {
    if (column === 'id') return null;
    const missing = cleanData.map(r => r[column]).filter(v => v === null).length;
    return { variable: column, count: missing };
  })
  .filter(Boolean)
  .filter(item => item!.count > 0)
  .sort((a, b) => b!.count - a!.count);

// Helper to compute bin counts for histograms
const makeHistogram = (field: string, min: number, max: number, binsCount = 8) => {
  const step = (max - min) / binsCount;
  const ckdSub = imputedData.filter(r => r.classification === 'yes').map(r => r[field]);
  const healthySub = imputedData.filter(r => r.classification === 'no').map(r => r[field]);

  const healthyBins = Array(binsCount).fill(0);
  const ckdBins = Array(binsCount).fill(0);

  healthySub.forEach(val => {
    const idx = Math.min(binsCount - 1, Math.floor((val - min) / step));
    if (idx >= 0) healthyBins[idx]++;
  });

  ckdSub.forEach(val => {
    const idx = Math.min(binsCount - 1, Math.floor((val - min) / step));
    if (idx >= 0) ckdBins[idx]++;
  });

  return {
    healthy: healthySub,
    ckd: ckdSub,
    healthyBins,
    ckdBins,
    min,
    max,
    step
  };
};

const HIST_DATA: Record<string, any> = {
  hemo: { label: 'Hemoglobin', unit: 'g/dL', min: 5, max: 17, ...makeHistogram('hemo', 5, 17) },
  sc: { label: 'Serum Creatinine', unit: 'mg/dL', min: 0.4, max: 24, ...makeHistogram('sc', 0.4, 24) },
  bgr: { label: 'Blood Glucose Random', unit: 'mg/dL', min: 70, max: 490, ...makeHistogram('bgr', 70, 490) },
  age: { label: 'Patient Age', unit: 'years', min: 5, max: 80, ...makeHistogram('age', 5, 80) }
};

// Compute boxplot statistics (Min, Q1, Median, Q3, Max, Outliers)
const computeBoxPlot = (vals: number[]) => {
  if (vals.length === 0) return { min: 0, q1: 0, med: 0, q3: 0, max: 0, outliers: [] };
  const sorted = [...vals].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  const getPercentile = (p: number) => {
    const index = p * (sorted.length - 1);
    const low = Math.floor(index);
    const high = Math.ceil(index);
    return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
  };

  const q1 = getPercentile(0.25);
  const med = getPercentile(0.50);
  const q3 = getPercentile(0.75);

  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const nonOutliers = sorted.filter(v => v >= lowerFence && v <= upperFence);
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence);

  return {
    min: nonOutliers[0] || min,
    q1,
    med,
    q3,
    max: nonOutliers[nonOutliers.length - 1] || max,
    outliers
  };
};

const getBoxData = (field: string) => {
  const ckdVals = imputedData.filter(r => r.classification === 'yes').map(r => r[field]);
  const healthyVals = imputedData.filter(r => r.classification === 'no').map(r => r[field]);
  return {
    healthy: computeBoxPlot(healthyVals),
    ckd: computeBoxPlot(ckdVals)
  };
};

const BOX_DATA = {
  hemo: { label: 'Hemoglobin', unit: 'g/dL', ...getBoxData('hemo') },
  sc: { label: 'Serum Creatinine', unit: 'mg/dL', ...getBoxData('sc') },
  bp: { label: 'Blood Pressure', unit: 'mm/Hg', ...getBoxData('bp') }
};

// Correlation Matrix
const CORR_FEATURES = ['sc', 'bu', 'bgr', 'bp', 'age', 'pot', 'sod', 'hemo', 'pcv', 'rc'];
const CORR_MATRIX: number[][] = [];
for (let i = 0; i < CORR_FEATURES.length; i++) {
  const row: number[] = [];
  const f1 = CORR_FEATURES[i];
  const vals1 = imputedData.map(r => r[f1]);
  const mean1 = vals1.reduce((a, b) => a + b, 0) / vals1.length;
  
  for (let j = 0; j < CORR_FEATURES.length; j++) {
    const f2 = CORR_FEATURES[j];
    const vals2 = imputedData.map(r => r[f2]);
    const mean2 = vals2.reduce((a, b) => a + b, 0) / vals2.length;
    
    let num = 0;
    let den1 = 0;
    let den2 = 0;
    for (let k = 0; k < imputedData.length; k++) {
      const diff1 = vals1[k] - mean1;
      const diff2 = vals2[k] - mean2;
      num += diff1 * diff2;
      den1 += diff1 * diff1;
      den2 += diff2 * diff2;
    }
    const r = num / Math.sqrt(den1 * den2);
    row.push(parseFloat((isNaN(r) ? 0 : r).toFixed(3)));
  }
  CORR_MATRIX.push(row);
}

// Model fitting: We train a Logistic Regression on the dataset.
// Features: age, bp, bgr, bu, sc, hemo, htn_yes, dm_yes (8 variables)
// We normalize these features using Z-score (using the training features' mean and SD)
// Let's standardise features to make gradient descent highly stable!
const stdParams: Record<string, { mean: number; sd: number }> = {};
const keyPredictors = ['age', 'bp', 'bgr', 'bu', 'sc', 'hemo', 'htn', 'dm'];

keyPredictors.forEach(p => {
  if (p === 'htn' || p === 'dm') return;
  const vals = imputedData.map(r => r[p]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (vals.length - 1));
  stdParams[p] = { mean, sd };
});

const formatFeatures = (row: any) => {
  const x: number[] = [];
  x.push((row.age - stdParams.age.mean) / stdParams.age.sd);
  x.push((row.bp - stdParams.bp.mean) / stdParams.bp.sd);
  x.push((row.bgr - stdParams.bgr.mean) / stdParams.bgr.sd);
  x.push((row.bu - stdParams.bu.mean) / stdParams.bu.sd);
  x.push((row.sc - stdParams.sc.mean) / stdParams.sc.sd);
  x.push((row.hemo - stdParams.hemo.mean) / stdParams.hemo.sd);
  x.push(row.htn === 'yes' ? 1.0 : 0.0);
  x.push(row.dm === 'yes' ? 1.0 : 0.0);
  return x;
};

// Training Logistic regression using gradient descent
// Labels: ckd ('yes') -> 1, healthy ('no') -> 0
const X = imputedData.map(formatFeatures);
const Y = imputedData.map(row => row.classification === 'yes' ? 1 : 0);

let w = Array(X[0].length).fill(0);
let b = 0;
const lr = 0.5;
const epochs = 10000;
const lambda = 0.01; // L2 regularization

for (let epoch = 0; epoch < epochs; epoch++) {
  let dw = Array(w.length).fill(0);
  let db = 0;
  
  for (let i = 0; i < X.length; i++) {
    const x_i = X[i];
    const y_i = Y[i];
    let z = b;
    for (let j = 0; j < w.length; j++) z += w[j] * x_i[j];
    const p = 1 / (1 + Math.exp(-z));
    const error = p - y_i;
    
    db += error;
    for (let j = 0; j < w.length; j++) {
      dw[j] += error * x_i[j];
    }
  }
  
  db /= X.length;
  b -= lr * db;
  for (let j = 0; j < w.length; j++) {
    dw[j] /= X.length;
    // Add L2 penalty
    dw[j] += lambda * w[j];
    w[j] -= lr * dw[j];
  }
}

console.log('--- FITTED MODEL COEFFICIENTS (STANDARDIZED) ---');
console.log('w:', w);
console.log('b:', b);
console.log('Intercept & Standardized predictors:');
const predictorsText = ['age', 'bp', 'bgr', 'bu', 'sc', 'hemo', 'htn_yes', 'dm_yes'];
predictorsText.forEach((name, idx) => {
  console.log(`${name}: ${w[idx]}`);
});
console.log('Intercept:', b);

// Let's print out stdParams so we can use them to normalize inputs in the React UI!
console.log('Imputation Means for the numeric fields:');
console.log(means);
console.log('Standardization Parameters:');
console.log(stdParams);

// Calculate exact model metrics
// Let's do a simple 70/30 split or check performance on the whole dataset (or cross validated)
// According to the Rmd, they get high accuracy. Let's compute actual training accuracy and metrics!
const probs = imputedData.map((row, i) => {
  const x = X[i];
  let z = b;
  for (let j = 0; j < w.length; j++) z += w[j] * x[j];
  const p = 1 / (1 + Math.exp(-z));
  return p;
});

const predictions = probs.map(p => p > 0.5 ? 1 : 0);
let tp = 0, tn = 0, fp = 0, fn = 0;
for (let i = 0; i < Y.length; i++) {
  if (Y[i] === 1 && predictions[i] === 1) tp++;
  else if (Y[i] === 0 && predictions[i] === 0) tn++;
  else if (Y[i] === 1 && predictions[i] === 0) fn++;
  else if (Y[i] === 0 && predictions[i] === 1) fp++;
}

const accuracy = (tp + tn) / Y.length;
const sensitivity = tp / (tp + fn);
const specificity = tn / (tn + fp);

console.log('--- ALL METRICS ON DATA ---');
console.log({
  accuracy,
  sensitivity,
  specificity,
  tp,
  tn,
  fp,
  fn
});

// Let's construct the final output file
const statsSummary = {
  CKD_COLUMNS,
  MISSING_DATA,
  HIST_DATA,
  BOX_DATA,
  CORR_MATRIX,
  MODEL_WEIGHTS: {
    weights: w,
    intercept: b,
    stdParams,
    means // imputation fallbacks
  },
  METRICS: {
    accuracy,
    sensitivity,
    specificity,
    tp,
    tn,
    fp,
    fn
  }
};

fs.writeFileSync(path.join(process.cwd(), 'src', 'real_stats.json'), JSON.stringify(statsSummary, null, 2));
console.log('Successfully wrote src/real_stats.json!');
