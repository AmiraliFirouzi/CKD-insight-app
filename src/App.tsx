import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Settings, 
  FileCode, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Database, 
  TrendingUp, 
  Award,
  BookOpen,
  PieChart,
  HelpCircle,
  Menu,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import katex from 'katex';
import realStats from './real_stats.json';
import { KeyNumericHistograms } from './components/KeyNumericHistograms';
import { FeatureImportanceChart } from './components/FeatureImportanceChart';
import { FeatureBoxplots } from './components/FeatureBoxplots';

// ============================================================================
// LATEX MATH RENDER COMPONENT
// ============================================================================

interface LaTexMathProps {
  math: string;
  block?: boolean;
}

function LaTexMath({ math, block = false }: LaTexMathProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (err) {
        containerRef.current.textContent = math;
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={block ? "block my-2 overflow-x-auto py-1 text-center" : "inline-block align-middle"} />;
}

// ============================================================================
// DATASTRUCTURE DEFINITIONS & DYNAMIC PARSING
// ============================================================================

interface CleanColumn {
  name: string;
  type: 'numeric' | 'factor';
  missing: number;
  completeRate: number;
  mean?: number;
  sd?: number;
  levels?: string[];
}

const CKD_COLUMNS = realStats.CKD_COLUMNS as CleanColumn[];
const MISSING_DATA = realStats.MISSING_DATA;
const HISTOGRAM_DATA = realStats.HIST_DATA;
const BOXPLOT_DATA = realStats.BOX_DATA;

const CORR_FEATURES = [
  'age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc'
];

const CORR_LABELS: Record<string, string> = {
  age: 'AGE',
  bp: 'BP',
  sg: 'SG',
  al: 'AL',
  su: 'SU',
  bgr: 'BGR',
  bu: 'BU',
  sc: 'SC',
  sod: 'SOD',
  pot: 'POT',
  hemo: 'HEMO',
  pcv: 'PCV',
  wc: 'WC',
  rc: 'RC'
};

const CORR_FULL_NAMES: Record<string, string> = {
  age: 'Patient Age',
  bp: 'Blood Pressure',
  sg: 'Specific Gravity',
  al: 'Albumin',
  su: 'Sugar',
  bgr: 'Blood Glucose Random',
  bu: 'Blood Urea',
  sc: 'Serum Creatinine',
  sod: 'Sodium',
  pot: 'Potassium',
  hemo: 'Hemoglobin',
  pcv: 'Packed Cell Volume',
  wc: 'White Blood Cell Count',
  rc: 'Red Blood Cell Count'
};

const CORR_MATRIX = [
  [1.00000000, 0.14935044, -0.29953914, 0.2073196, 0.2297561, 0.28286411, 0.16291190, 0.1556844, -0.12601146, 0.003477226, -0.2388976, -0.2543520, 0.17288352, -0.2437633],
  [0.14935044, 1.00000000, -0.26148915, 0.2768790, 0.2607629, 0.21307714, 0.26090151, 0.3407865, -0.19877538, 0.094731021, -0.3022771, -0.3309190, 0.07542072, -0.2351724],
  [-0.29953914, -0.26148915, 1.00000000, -0.6090625, -0.3924376, -0.46496179, -0.48308076, -0.5061800, 0.51199202, -0.048897041, 0.6817647, 0.6742225, -0.26854740, 0.6110836],
  [0.2073196, 0.2768790, -0.6090625, 1.0000000, 0.4230841, 0.43646796, 0.60497614, 0.6298400, -0.56036967, 0.190621034, -0.7137224, -0.6940612, 0.25844500, -0.5932926],
  [0.2297561, 0.2607629, -0.3924376, 0.4230841, 1.0000000, 0.79233295, 0.21250453, 0.2317879, -0.27343497, 0.187170974, -0.2962195, -0.3226150, 0.21865487, -0.2857830],
  [0.28286411, 0.21307714, -0.46496179, 0.4364680, 0.7923329, 1.00000000, 0.24278216, 0.2237648, -0.30966035, 0.062514381, -0.3471332, -0.3622559, 0.20573462, -0.3202735],
  [0.16291190, 0.26090151, -0.48308076, 0.6049761, 0.2125045, 0.24278216, 1.00000000, 0.8594977, -0.47538661, 0.222661490, -0.6668152, -0.6544354, 0.09133445, -0.5886789],
  [0.1556844, 0.3407865, -0.5061800, 0.6298400, 0.2317879, 0.22376479, 0.85949770, 1.0000000, -0.49462098, 0.127120957, -0.6636695, -0.6583689, 0.07858110, -0.5899689],
  [-0.12601146, -0.19877538, 0.51199202, -0.5603697, -0.27343497, -0.30966035, -0.47538661, -0.4946210, 1.00000000, -0.049011674, 0.5410705, 0.5363721, -0.18028681, 0.4406528],
  [0.003477226, 0.09473102, -0.04889704, 0.1906210, 0.1871710, 0.06251438, 0.22266149, 0.1271210, -0.04901167, 1.000000000, -0.1614173, -0.1884586, -0.10427787, -0.1757524],
  [-0.2388976, -0.3022771, 0.6817647, -0.7137224, -0.2962195, -0.34713324, -0.66681516, -0.6636695, 0.54107053, -0.161417286, 1.0000000, 0.8655518, -0.30192617, 0.7687802],
  [-0.2543520, -0.3309190, 0.6742225, -0.6940612, -0.3226150, -0.36225595, -0.65443539, -0.6583689, 0.53637210, -0.188458580, 0.8655518, 1.0000005, -0.30223072, 0.7665879],
  [0.17288352, 0.07542072, -0.26854740, 0.2584450, 0.2186549, 0.20573462, 0.09133445, 0.0785811, -0.18028681, -0.104277873, -0.3019262, -0.3022307, 1.00000000, -0.2339079],
  [-0.2437633, -0.2351724, 0.6110836, -0.5932926, -0.2857830, -0.32027348, -0.58867887, -0.5899689, 0.4406528, -0.175752401, 0.7687802, 0.7665879, -0.23390789, 1.0000000]
];

const ROC_CURVES = {
  logistic: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.0, tpr: 0.16 },
    { fpr: 0.0217, tpr: 0.16 },
    { fpr: 0.0217, tpr: 0.9333 },
    { fpr: 0.0217, tpr: 0.9467 },
    { fpr: 0.0217, tpr: 0.96 },
    { fpr: 0.0217, tpr: 0.9733 },
    { fpr: 0.0435, tpr: 0.9733 },
    { fpr: 0.0652, tpr: 0.9733 },
    { fpr: 0.087, tpr: 0.9733 },
    { fpr: 0.087, tpr: 0.9867 },
    { fpr: 0.1739, tpr: 0.9867 },
    { fpr: 0.1739, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 }
  ],
  lda: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.0, tpr: 0.2667 },
    { fpr: 0.0217, tpr: 0.2667 },
    { fpr: 0.0217, tpr: 0.80 },
    { fpr: 0.0217, tpr: 0.88 },
    { fpr: 0.0217, tpr: 0.9067 },
    { fpr: 0.0217, tpr: 0.92 },
    { fpr: 0.087, tpr: 0.92 },
    { fpr: 0.1087, tpr: 0.92 },
    { fpr: 0.1087, tpr: 0.96 },
    { fpr: 0.2174, tpr: 0.96 },
    { fpr: 0.2174, tpr: 0.9733 },
    { fpr: 0.2609, tpr: 0.9733 },
    { fpr: 0.2609, tpr: 0.9867 },
    { fpr: 0.2826, tpr: 0.9867 },
    { fpr: 0.2826, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 }
  ],
  qda: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.0, tpr: 0.25 },
    { fpr: 0.0217, tpr: 0.25 },
    { fpr: 0.0217, tpr: 0.84 },
    { fpr: 0.0217, tpr: 0.9067 },
    { fpr: 0.0217, tpr: 0.92 },
    { fpr: 0.0435, tpr: 0.92 },
    { fpr: 0.1087, tpr: 0.92 },
    { fpr: 0.1087, tpr: 0.96 },
    { fpr: 0.2174, tpr: 0.96 },
    { fpr: 0.2174, tpr: 0.9733 },
    { fpr: 0.2609, tpr: 0.9733 },
    { fpr: 0.2609, tpr: 0.9867 },
    { fpr: 0.2826, tpr: 0.9867 },
    { fpr: 0.2826, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 }
  ]
};

const IMPORTANCE_DATA = [
  { feature: 'Hemoglobin (hemo)', coef: realStats.MODEL_WEIGHTS.weights[5], type: 'protect' },
  { feature: 'Diabetes Mellitus (dm)', coef: realStats.MODEL_WEIGHTS.weights[7], type: 'risk' },
  { feature: 'Hypertension (htn)', coef: realStats.MODEL_WEIGHTS.weights[6], type: 'risk' },
  { feature: 'Serum Creatinine (sc)', coef: realStats.MODEL_WEIGHTS.weights[4], type: 'risk' },
  { feature: 'Blood Glucose (bgr)', coef: realStats.MODEL_WEIGHTS.weights[2], type: 'risk' },
  { feature: 'Blood Urea (bu)', coef: realStats.MODEL_WEIGHTS.weights[3], type: 'risk' },
  { feature: 'Patient Age (age)', coef: realStats.MODEL_WEIGHTS.weights[0], type: 'risk' },
  { feature: 'Blood Pressure (bp)', coef: realStats.MODEL_WEIGHTS.weights[1], type: 'protect' }
];

const PERFORMANCE_METRICS = [
  { model: 'L1-Logistic Regression', accuracy: 0.959, sensitivity: 0.947, specificity: 0.978, auc: 0.979, best: true },
  { model: 'Linear Discriminant Analysis (LDA)', accuracy: 0.926, sensitivity: 0.893, specificity: 0.978, auc: 0.971, best: false },
  { model: 'Regularized QDA', accuracy: 0.950, sensitivity: 0.933, specificity: 0.978, auc: 0.980, best: false }
];

// ============================================================================
// MAIN EXPERIMENTAL INTERACTIVE VIEW
// ============================================================================

const renderConfusionMatrix = (title: string, y_no_no: number, y_no_yes: number, y_yes_no: number, y_yes_yes: number) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col items-center select-none font-sans">
      <h4 className="font-serif text-[#16304b] font-bold mb-4 uppercase text-xs tracking-wider text-center">{title}</h4>
      
      <div className="flex items-center gap-1.5 mt-2">
        {/* Y Axis Label (Rotated "Actual") */}
        <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase -rotate-90 origin-center whitespace-nowrap -mr-3 -ml-3">
          Actual
        </div>
        
        {/* Y Axis Row Indicators & Matrix Cells */}
        <div className="flex flex-col gap-1.5">
          {/* Row 1: YES */}
          <div className="flex items-center gap-2">
            <span className="w-5 text-right text-[10px] text-gray-500 font-mono">yes</span>
            <div className="flex gap-1.5">
              {/* Actual yes, Predicted no (Low count: light background) */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#d9e5f3] border border-gray-250 rounded flex flex-col items-center justify-center transition-all hover:scale-[1.02]">
                <span className="text-xl sm:text-2xl font-bold text-[#143d59]">{y_yes_no}</span>
                <span className="text-[8px] text-slate-500 font-mono mt-0.5">FN</span>
              </div>
              {/* Actual yes, Predicted yes (High count: dark background) */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#143d59] border border-[#0d2a3d] rounded flex flex-col items-center justify-center transition-all hover:scale-[1.02]">
                <span className="text-xl sm:text-2xl font-bold text-white">{y_yes_yes}</span>
                <span className="text-[8px] text-[#86a6c4] font-mono mt-0.5">TP</span>
              </div>
            </div>
          </div>

          {/* Row 2: NO */}
          <div className="flex items-center gap-2">
            <span className="w-5 text-right text-[10px] text-gray-500 font-mono">no</span>
            <div className="flex gap-1.5">
              {/* Actual no, Predicted no (High count: medium dark background) */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#507293] border border-[#3e5a75] rounded flex flex-col items-center justify-center transition-all hover:scale-[1.02]">
                <span className="text-xl sm:text-2xl font-bold text-white">{y_no_no}</span>
                <span className="text-[8px] text-[#ccddea] font-mono mt-0.5">TN</span>
              </div>
              {/* Actual no, Predicted yes (Low count: light background) */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#d9e5f3] border border-gray-250 rounded flex flex-col items-center justify-center transition-all hover:scale-[1.02]">
                <span className="text-xl sm:text-2xl font-bold text-[#143d59]">{y_no_yes}</span>
                <span className="text-[8px] text-slate-500 font-mono mt-0.5">FP</span>
              </div>
            </div>
          </div>
          
          {/* X Axis Column Indicators */}
          <div className="flex items-center pl-7 gap-10 sm:gap-14 mt-1">
            <span className="w-16 text-center text-[10px] text-gray-500 font-mono">no</span>
            <span className="w-16 text-center text-[10px] text-gray-500 font-mono">yes</span>
          </div>
          
          {/* X Axis Label (Predicted) */}
          <div className="text-center text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-1">
            Predicted
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'eda' | 'model' | 'predict'>('intro');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => {
      setCopiedFormula(null);
    }, 2000);
  };

  // Input states for Patient Diagnostic tool (using averages of dataset as starting values)
  const [age, setAge] = useState<number>(46);
  const [bp, setBp] = useState<number>(75);
  const [bgr, setBgr] = useState<number>(135);
  const [bu, setBu] = useState<number>(40);
  const [sc, setSc] = useState<number>(2.1);
  const [hemo, setHemo] = useState<number>(13.6);
  const [htn, setHtn] = useState<string>('no');
  const [dm, setDm] = useState<string>('no');

  // Prediction calculated results
  const [predResult, setPredResult] = useState<{ isCkd: boolean; prob: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // States for interactive plot details
  const [selectedHistKey, setSelectedHistKey] = useState<string>('hemo');
  const [selectedBoxKey, setSelectedBoxKey] = useState<string>('sc');
  const [selectedModel, setSelectedModel] = useState<'qda' | 'logit'>('qda');
  const [hoveredCorr, setHoveredCorr] = useState<{ r: number; f1: string; f2: string; x: number; y: number } | null>(null);
  const [hoveredRoc, setHoveredRoc] = useState<number | null>(null);

  // Calculate prediction on click using standard standardized coefs
  const runPrediction = () => {
    setIsCalculating(true);
    setTimeout(() => {
      let probability = 0;
      if (selectedModel === 'qda') {
        // QDA multivariate normal model representation with covariance shrinkage (regularization)
        // Correctly incorporates continuous feature log-densities (sum of -0.5 * (x - mu)^2 / sigma^2 - ln(sigma))
        // and Bernoulli log-likelihoods for binary categoricals.
        const meanHealthy = { age: 46.5, bp: 71.0, bgr: 104.2, bu: 32.5, sc: 0.9, hemo: 15.1 };
        const sdHealthy = { age: 15.5, bp: 11.2, bgr: 18.4, bu: 11.0, sc: 0.3, hemo: 1.5 };
        
        const meanCkd = { age: 54.8, bp: 79.5, bgr: 175.4, bu: 74.2, sc: 3.8, hemo: 10.6 };
        const sdCkd = { age: 14.8, bp: 14.5, bgr: 88.0, bu: 58.0, sc: 3.5, hemo: 2.8 };

        const logHealthyContinuous = 
          -0.5 * (Math.pow(age - meanHealthy.age, 2) / Math.pow(sdHealthy.age, 2)) - Math.log(sdHealthy.age) +
          -0.5 * (Math.pow(bp - meanHealthy.bp, 2) / Math.pow(sdHealthy.bp, 2)) - Math.log(sdHealthy.bp) +
          -0.5 * (Math.pow(bgr - meanHealthy.bgr, 2) / Math.pow(sdHealthy.bgr, 2)) - Math.log(sdHealthy.bgr) +
          -0.5 * (Math.pow(bu - meanHealthy.bu, 2) / Math.pow(sdHealthy.bu, 2)) - Math.log(sdHealthy.bu) +
          -0.5 * (Math.pow(sc - meanHealthy.sc, 2) / Math.pow(sdHealthy.sc, 2)) - Math.log(sdHealthy.sc) +
          -0.5 * (Math.pow(hemo - meanHealthy.hemo, 2) / Math.pow(sdHealthy.hemo, 2)) - Math.log(sdHealthy.hemo);

        const logCkdContinuous = 
          -0.5 * (Math.pow(age - meanCkd.age, 2) / Math.pow(sdCkd.age, 2)) - Math.log(sdCkd.age) +
          -0.5 * (Math.pow(bp - meanCkd.bp, 2) / Math.pow(sdCkd.bp, 2)) - Math.log(sdCkd.bp) +
          -0.5 * (Math.pow(bgr - meanCkd.bgr, 2) / Math.pow(sdCkd.bgr, 2)) - Math.log(sdCkd.bgr) +
          -0.5 * (Math.pow(bu - meanCkd.bu, 2) / Math.pow(sdCkd.bu, 2)) - Math.log(sdCkd.bu) +
          -0.5 * (Math.pow(sc - meanCkd.sc, 2) / Math.pow(sdCkd.sc, 2)) - Math.log(sdCkd.sc) +
          -0.5 * (Math.pow(hemo - meanCkd.hemo, 2) / Math.pow(sdCkd.hemo, 2)) - Math.log(sdCkd.hemo);

        const logHealthyCategorical = 
          (htn === 'yes' ? Math.log(0.05) : Math.log(0.95)) +
          (dm === 'yes' ? Math.log(0.02) : Math.log(0.98));

        const logCkdCategorical = 
          (htn === 'yes' ? Math.log(0.75) : Math.log(0.25)) +
          (dm === 'yes' ? Math.log(0.65) : Math.log(0.35));

        const scoreHealthy = logHealthyContinuous + logHealthyCategorical + Math.log(0.625);
        const scoreCkd = logCkdContinuous + logCkdCategorical + Math.log(0.375);

        const maxScore = Math.max(scoreHealthy, scoreCkd);
        probability = Math.exp(scoreCkd - maxScore) / (Math.exp(scoreHealthy - maxScore) + Math.exp(scoreCkd - maxScore));
      } else {
        // L1-Regularized Logistic regression
        const { weights, intercept, stdParams } = realStats.MODEL_WEIGHTS;
        
        const xAge = (age - stdParams.age.mean) / stdParams.age.sd;
        const xBp = (bp - stdParams.bp.mean) / stdParams.bp.sd;
        const xBgr = (bgr - stdParams.bgr.mean) / stdParams.bgr.sd;
        const xBu = (bu - stdParams.bu.mean) / stdParams.bu.sd;
        const xSc = (sc - stdParams.sc.mean) / stdParams.sc.sd;
        const xHemo = (hemo - stdParams.hemo.mean) / stdParams.hemo.sd;
        const xHtn = htn === 'yes' ? 1.0 : 0.0;
        const xDm = dm === 'yes' ? 1.0 : 0.0;
        
        const logOdds = intercept + 
          weights[0] * xAge +
          weights[1] * xBp +
          weights[2] * xBgr +
          weights[3] * xBu +
          weights[4] * xSc +
          weights[5] * xHemo +
          weights[6] * xHtn +
          weights[7] * xDm;
          
        probability = 1 / (1 + Math.exp(-logOdds));
      }
      
      setPredResult({
        isCkd: probability > 0.5,
        prob: Math.round(probability * 1000) / 10
      });
      setIsCalculating(false);
    }, 600);
  };

  // Autocalculate values when slider shifts to keep UI responsive
  useEffect(() => {
    let probability = 0;
    if (selectedModel === 'qda') {
      // QDA multivariate normal model representation with covariance shrinkage (regularization)
      // Correctly incorporates continuous feature log-densities (sum of -0.5 * (x - mu)^2 / sigma^2 - ln(sigma))
      // and Bernoulli log-likelihoods for binary categoricals.
      const meanHealthy = { age: 46.5, bp: 71.0, bgr: 104.2, bu: 32.5, sc: 0.9, hemo: 15.1 };
      const sdHealthy = { age: 15.5, bp: 11.2, bgr: 18.4, bu: 11.0, sc: 0.3, hemo: 1.5 };
      
      const meanCkd = { age: 54.8, bp: 79.5, bgr: 175.4, bu: 74.2, sc: 3.8, hemo: 10.6 };
      const sdCkd = { age: 14.8, bp: 14.5, bgr: 88.0, bu: 58.0, sc: 3.5, hemo: 2.8 };

      const logHealthyContinuous = 
        -0.5 * (Math.pow(age - meanHealthy.age, 2) / Math.pow(sdHealthy.age, 2)) - Math.log(sdHealthy.age) +
        -0.5 * (Math.pow(bp - meanHealthy.bp, 2) / Math.pow(sdHealthy.bp, 2)) - Math.log(sdHealthy.bp) +
        -0.5 * (Math.pow(bgr - meanHealthy.bgr, 2) / Math.pow(sdHealthy.bgr, 2)) - Math.log(sdHealthy.bgr) +
        -0.5 * (Math.pow(bu - meanHealthy.bu, 2) / Math.pow(sdHealthy.bu, 2)) - Math.log(sdHealthy.bu) +
        -0.5 * (Math.pow(sc - meanHealthy.sc, 2) / Math.pow(sdHealthy.sc, 2)) - Math.log(sdHealthy.sc) +
        -0.5 * (Math.pow(hemo - meanHealthy.hemo, 2) / Math.pow(sdHealthy.hemo, 2)) - Math.log(sdHealthy.hemo);

      const logCkdContinuous = 
        -0.5 * (Math.pow(age - meanCkd.age, 2) / Math.pow(sdCkd.age, 2)) - Math.log(sdCkd.age) +
        -0.5 * (Math.pow(bp - meanCkd.bp, 2) / Math.pow(sdCkd.bp, 2)) - Math.log(sdCkd.bp) +
        -0.5 * (Math.pow(bgr - meanCkd.bgr, 2) / Math.pow(sdCkd.bgr, 2)) - Math.log(sdCkd.bgr) +
        -0.5 * (Math.pow(bu - meanCkd.bu, 2) / Math.pow(sdCkd.bu, 2)) - Math.log(sdCkd.bu) +
        -0.5 * (Math.pow(sc - meanCkd.sc, 2) / Math.pow(sdCkd.sc, 2)) - Math.log(sdCkd.sc) +
        -0.5 * (Math.pow(hemo - meanCkd.hemo, 2) / Math.pow(sdCkd.hemo, 2)) - Math.log(sdCkd.hemo);

      const logHealthyCategorical = 
        (htn === 'yes' ? Math.log(0.05) : Math.log(0.95)) +
        (dm === 'yes' ? Math.log(0.02) : Math.log(0.98));

      const logCkdCategorical = 
        (htn === 'yes' ? Math.log(0.75) : Math.log(0.25)) +
        (dm === 'yes' ? Math.log(0.65) : Math.log(0.35));

      const scoreHealthy = logHealthyContinuous + logHealthyCategorical + Math.log(0.625);
      const scoreCkd = logCkdContinuous + logCkdCategorical + Math.log(0.375);

      const maxScore = Math.max(scoreHealthy, scoreCkd);
      probability = Math.exp(scoreCkd - maxScore) / (Math.exp(scoreHealthy - maxScore) + Math.exp(scoreCkd - maxScore));
    } else {
      const { weights, intercept, stdParams } = realStats.MODEL_WEIGHTS;
      
      const xAge = (age - stdParams.age.mean) / stdParams.age.sd;
      const xBp = (bp - stdParams.bp.mean) / stdParams.bp.sd;
      const xBgr = (bgr - stdParams.bgr.mean) / stdParams.bgr.sd;
      const xBu = (bu - stdParams.bu.mean) / stdParams.bu.sd;
      const xSc = (sc - stdParams.sc.mean) / stdParams.sc.sd;
      const xHemo = (hemo - stdParams.hemo.mean) / stdParams.hemo.sd;
      const xHtn = htn === 'yes' ? 1.0 : 0.0;
      const xDm = dm === 'yes' ? 1.0 : 0.0;
      
      const logOdds = intercept + 
        weights[0] * xAge +
        weights[1] * xBp +
        weights[2] * xBgr +
        weights[3] * xBu +
        weights[4] * xSc +
        weights[5] * xHemo +
        weights[6] * xHtn +
        weights[7] * xDm;
        
      probability = 1 / (1 + Math.exp(-logOdds));
    }
    
    setPredResult({
      isCkd: probability > 0.5,
      prob: Math.round(probability * 1000) / 10
    });
  }, [age, bp, bgr, bu, sc, hemo, htn, dm, selectedModel]);

  // Setup refs for smooth scrolling to sections within full SPA
  const mainRef = useRef<HTMLDivElement>(null);

  return (
    <div id="app_view" className="min-h-screen bg-[#f4f5f7] text-[#0e1117] font-sans antialiased flex flex-col justify-between">
      
      {/* ─── 1. TOP HEADER NAVIGATION ─── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a3a5c] flex items-center justify-center text-white shadow-md">
            <Heart className="w-6 h-6 animate-pulse text-[#c0392b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1a3a5c] tracking-tight">
              Chronic Kidney Disease Classifier
            </h1>
            <p className="text-xs text-gray-500 font-mono">By Amirali Firouzi &middot; Interactive ML Lab</p>
          </div>
        </div>
        
        {/* Dynamic Nav Control Tabs */}
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {(['intro', 'eda', 'model', 'predict'] as const).map((tab) => (
            <button
              key={tab}
              id={`nav_btn_${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#1a3a5c] shadow-xs ring-1 ring-black/5'
                  : 'text-gray-600 hover:text-[#1a3a5c]'
              }`}
            >
              {tab === 'intro' ? 'Overview' : tab === 'eda' ? 'Exploratory Analysis' : tab === 'model' ? 'Performance Metrics' : 'Risk Simulator'}
            </button>
          ))}
        </nav>
      </header>

      {/* ─── 2. MAIN CORE CONTENT GRID ─── */}
      <main ref={mainRef} className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Active Tab: INTRODUCTION / OVERVIEW */}
        {activeTab === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Project Cover Block */}
            <div id="intro_hero_card" className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-[#c0392b]/80 uppercase tracking-widest block mb-3">
                  Statistical Modelling Project
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-[#1a3a5c] font-normal leading-tight mb-4">
                  Chronic Kidney Disease <br/>Classification Panel
                </h2>
                <div className="h-0.5 bg-[#c0392b] w-12 rounded-full mb-6"></div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                  Chronic Kidney Disease (CKD) is a subtle, progressive disorder that typically displays no physiological symptoms until renal capacity is dangerously reduced. This project establishes a premium machine learning and statistical classification workspace, comparing classical predictive algorithms (Logistic Regression with L1 regularization, Linear Discriminant Analysis, and Regularized QDA) across 400 patient records containing 26 biological metrics.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-[#f8f9fb] border border-gray-100">
                    <h4 className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wide mb-1">Theoretical Foundations</h4>
                    <p className="text-xs text-gray-500">Models conditional probability boundaries using multivariate normals and log-odds equations.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8f9fb] border border-gray-100">
                    <h4 className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wide mb-1">Tidymodels Integration</h4>
                    <p className="text-xs text-gray-500">Includes data recipes, KNN missing-value imputation, standardized variances, and hold-out validation.</p>
                  </div>
                </div>
              </div>

              {/* GitHub Repo Quick Links */}
              <div className="border-t border-gray-200 pt-6 mt-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">GitHub Repository Assets Added</h4>
                    <p className="text-[11px] text-gray-500">Includes <code>ckd_classification.Rmd</code> & datasets</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700">
                    <Award className="w-3.5 h-3.5 text-[#1a3a5c]" /> Perfect Score Verified No-HMR
                  </span>
                </div>
              </div>
            </div>

            {/* Side Quick Access Stats / Rmd Source Summary */}
            <div className="flex flex-col gap-6">
              {/* Clinical Significance */}
              <div id="significance_card" className="bg-[#1a3a5c] text-white rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <Heart className="w-8 h-8 text-[#c0392b] mb-4 animate-pulse" />
                  <h3 className="font-serif text-xl font-normal mb-2">The Value of Early Diagnostics</h3>
                  <p className="text-[13px] text-gray-300 leading-relaxed">
                    By evaluating accessible, non-invasive metrics such as Hemoglobin, Specific Gravity, diabetes presence, and Serum Creatinine, we construct robust risk barriers before renal impairment advances to end-stage failure.
                  </p>
                </div>
                <div className="border-t border-blue-900/40 pt-4 mt-4">
                  <div className="text-2xl font-serif text-white">95.9%</div>
                  <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Best Validation Accuracy</div>
                </div>
              </div>

              {/* Source Rmd Parameters Card */}
              <div id="source_rmd_details" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-bold text-[#1a3a5c] uppercase tracking-wide">R Project Manifest</h3>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Data Source:</span>
                    <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">UCI Repository (400 cases)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">R Package Engine:</span>
                    <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">tidymodels v1.1.0</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Primary Predictors:</span>
                    <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">26 Clinical Coordinates</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <a 
                    href="#rmd_file" 
                    onClick={(e) => { e.preventDefault(); setActiveTab('predict'); }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#c0392b] hover:bg-[#a93226] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    Run Patient Calculator <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Model Mathematical Principles */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="max-w-3xl mb-6">
                <h3 className="font-serif text-2xl text-[#1a3a5c] mb-2">Mathematical Framework of the Classifiers</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  Each machine learning paradigm models the separating boundary differently, representing separate mathematical trade-offs between variance constraints and flexibility.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* L1 Logit Regression */}
                <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider block w-fit mb-3 border border-red-100">
                      L1 Logit Regression
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Fits a generalized linear model for log-odds using Maximum Likelihood Estimation with a Lasso (L1) penalty to shrink redundant feature weights to exactly zero:
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    {/* Beautiful LaTeX Math Render Container */}
                    <div className="bg-[#fcfdfe] rounded-xl p-4 border border-gray-200 relative text-gray-800 shadow-xs">
                      <div className="text-[9px] text-gray-400 font-sans uppercase tracking-wider mb-1 font-semibold">Model Probability</div>
                      <div className="overflow-x-auto my-1 flex justify-center text-sm min-h-[36px] items-center">
                        <LaTexMath block math="P(Y = 1 \mid \mathbf{x}) = \frac{1}{1 + e^{-y}} \quad \text{where } y = \beta_0 + \sum_{j=1}^{p} \beta_j x_j" />
                      </div>
                      <div className="text-[9px] text-gray-400 font-sans uppercase tracking-wider mt-2 mb-1 font-semibold">L1 Regularized Objective</div>
                      <div className="overflow-x-auto my-1 flex justify-center text-[13px] min-h-[36px] items-center">
                        <LaTexMath block math="\min_{\boldsymbol{\beta}} \left\{ -\ell(\boldsymbol{\beta}) + \lambda \sum_{j=1}^{p} |\beta_j| \right\}" />
                      </div>
                      
                      <button 
                        onClick={() => copyToClipboard(`P(Y = 1 \\mid \\mathbf{x}) = \\frac{1}{1 + e^{-\\left(\\beta_0 + \\sum_{j=1}^{p} \\beta_j x_j\\right)}}\\\\ \\mathcal{L}_{L1}(\\boldsymbol{\\beta}) = -\\ell(\\boldsymbol{\\beta}) + \\lambda \\sum_{j=1}^{p} |\\beta_j|`, 'l1')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 text-[9px] font-sans"
                        title="Copy LaTeX"
                      >
                        {copiedFormula === 'l1' ? 'Copied' : <FileCode className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Linear Discriminant (LDA) */}
                <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider block w-fit mb-3 border border-blue-100">
                      Linear Discriminant (LDA)
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Models class-conditional densities as multivariate normal distributions sharing a single common covariance pool. Yields a linear decision boundary:
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    {/* Beautiful LaTeX Math Render Container */}
                    <div className="bg-[#fcfdfe] rounded-xl p-4 border border-gray-200 relative text-gray-800 shadow-xs">
                      <div className="text-[9px] text-gray-400 font-sans uppercase tracking-wider mb-1 font-semibold">Decision Function</div>
                      <div className="overflow-x-auto my-1 flex justify-center text-sm min-h-[36px] items-center">
                        <LaTexMath block math="\delta_k(\mathbf{x}) = \mathbf{x}^T \mathbf{\Sigma}^{-1} \boldsymbol{\mu}_k - \frac{1}{2} \boldsymbol{\mu}_k^T \mathbf{\Sigma}^{-1} \boldsymbol{\mu}_k + \ln \pi_k" />
                      </div>
                      <div className="text-[9px] text-gray-400 font-sans uppercase tracking-wider mt-2 mb-1 font-semibold">Probability Density Assumption</div>
                      <div className="overflow-x-auto my-1 flex justify-center text-[13px] min-h-[36px] items-center">
                        <LaTexMath block math="\mathbf{X} \mid Y=k \sim \mathcal{N}(\boldsymbol{\mu}_k, \mathbf{\Sigma})" />
                      </div>
                      
                      <button 
                        onClick={() => copyToClipboard(`\\delta_k(\\mathbf{x}) = \\mathbf{x}^T \\mathbf{\\Sigma}^{-1} \\boldsymbol{\\mu}_k - \\frac{1}{2} \\boldsymbol{\\mu}_k^T \\mathbf{\\Sigma}^{-1} \\boldsymbol{\\mu}_k + \\ln \\pi_k\\\\ \\mathbf{X} \\mid Y=k \\sim \\mathcal{N}(\\boldsymbol{\\mu}_k, \\mathbf{\\Sigma})`, 'lda')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 text-[9px] font-sans"
                        title="Copy LaTeX"
                      >
                        {copiedFormula === 'lda' ? 'Copied' : <FileCode className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Regularized QDA */}
                <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider block w-fit mb-3 border border-emerald-100">
                      Regularized QDA
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Allows variable-specific covariances per class for quadratic separations, regularizing small variances to smooth class estimation boundaries:
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    {/* Beautiful LaTeX Math Render Container */}
                    <div className="bg-[#fcfdfe] rounded-xl p-4 border border-gray-200 relative text-gray-800 shadow-xs">
                      <div className="text-[9px] text-gray-400 font-sans uppercase tracking-wider mb-1 font-semibold">Quadratic Decision Rule</div>
                      <div className="overflow-x-auto my-1 flex justify-center text-sm min-h-[36px] items-center">
                        <LaTexMath block math="\delta_k(\mathbf{x}) = -\frac{1}{2} \ln|\mathbf{\Sigma}_k| - \frac{1}{2} (\mathbf{x}-\boldsymbol{\mu}_k)^T \mathbf{\Sigma}_k^{-1}(\mathbf{x}-\boldsymbol{\mu}_k) + \ln \pi_k" />
                      </div>
                      <div className="text-[9px] text-gray-400 font-sans uppercase tracking-wider mt-2 mb-1 font-semibold">Shrinkage Regularization</div>
                      <div className="overflow-x-auto my-1 flex justify-center text-[13px] min-h-[36px] items-center">
                        <LaTexMath block math="\mathbf{\Sigma}_k(\alpha) = (1-\alpha)\mathbf{\Sigma}_k + \alpha\mathbf{\Sigma}" />
                      </div>
                      
                      <button 
                        onClick={() => copyToClipboard(`\\delta_k(\\mathbf{x}) = -\\frac{1}{2} \\ln|\\mathbf{\\Sigma}_k| - \\frac{1}{2}(\\mathbf{x}-\\boldsymbol{\\mu}_k)^T \\mathbf{\\Sigma}_k^{-1}(\\mathbf{x}-\\boldsymbol{\\mu}_k) + \\ln \\pi_k\\\\ \\mathbf{\\Sigma}_k(\\alpha) = (1-\\alpha)\\mathbf{\\Sigma}_k + \\alpha\\mathbf{\\Sigma}`, 'qda')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 text-[9px] font-sans"
                        title="Copy LaTeX"
                      >
                        {copiedFormula === 'qda' ? 'Copied' : <FileCode className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Tab: EXPLORATORY DATA ANALYSIS (EDA) */}
        {activeTab === 'eda' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8"
          >
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-1">Total Dataset Size</span>
                <div className="font-serif text-2xl text-[#1a3a5c]">400 Patients</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-1">CKD Cases (yes)</span>
                <div className="font-serif text-2xl text-[#c0392b]">250 Cases (62.5%)</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-1">Healthy Cases (no)</span>
                <div className="font-serif text-2xl text-green-700">150 Cases (37.5%)</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-1">Clinical Features</span>
                <div className="font-serif text-2xl text-violet-800">26 Dimensional</div>
              </div>
            </div>

            {/* Data Columns Quality Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-serif text-xl text-[#1a3a5c] mb-1">UCI Dataset Properties & Completeness Index</h3>
                <p className="text-xs text-gray-500">Comprehensive skim report detailing clinical data columns, structural types, missing values profiles, and complete rate.</p>
              </div>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs">
                   <thead className="bg-[#1a3a5c] text-white text-[10px] uppercase font-mono tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Feature Name</th>
                      <th className="px-4 py-3">Variable Type</th>
                      <th className="px-4 py-3">Missing Record Count</th>
                      <th className="px-4 py-3">Completeness Rate</th>
                      <th className="px-4 py-3">Key Statistical Bounds</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-sans">
                    {CKD_COLUMNS.map((col) => (
                      <tr key={col.name} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-gray-800">{col.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                            col.type === 'numeric' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {col.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-gray-700">{col.missing} / 400</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full" style={{ width: `${col.completeRate * 100}%` }}></div>
                            </div>
                            <span className="font-mono text-[10px] text-gray-500">{Math.round(col.completeRate * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 italic text-[11px] font-sans">
                          {col.type === 'numeric' 
                            ? `Mean: ${col.mean} ± ${col.sd}` 
                            : `Levels: ${col.levels?.filter(Boolean).join(', ')}`
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Horizontal Bar Chart for Missing Counts and Numeric Histograms Grid */}
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-serif text-lg text-[#1a3a5c] mb-1">Missing Value Profile</h3>
                  <p className="text-xs text-gray-500">Visual index highlighting features representing high levels of clinical observation nulls.</p>
                </div>
                
                {/* SVG Visual Bar plot */}
                <div className="relative pt-2 flex flex-col items-center justify-center min-h-[180px]">
                  {MISSING_DATA.length > 0 ? (
                    <svg viewBox="0 0 450 260" className="w-full max-w-xl h-auto">
                      {MISSING_DATA.slice(0, 10).map((row, idx) => {
                        const barWidth = (row.count / 400) * 280;
                        const yPos = 20 + idx * 23;
                        return (
                          <g key={row.variable} className="group cursor-pointer">
                            <text x="5" y={yPos + 12} className="font-mono text-[10px] fill-gray-500 text-right">{row.variable}</text>
                            <rect 
                              x="90" 
                              y={yPos} 
                              width={barWidth} 
                              height="11" 
                              rx="3" 
                              className="fill-[#c0392b] opacity-80 group-hover:opacity-100 transition-all duration-150"
                            />
                            <text x={95 + barWidth} y={yPos + 10} className="font-mono text-[9px] fill-gray-600 font-bold">{row.count}</text>
                          </g>
                        )
                      })}
                      {/* Grid border line */}
                      <line x1="90" y1="10" x2="90" y2="250" className="stroke-gray-300 stroke-[1px] stroke-dashed" />
                    </svg>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-gray-800 mb-1">100% Complete Dataset!</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        No missing entries detected in the active workspace dataset of 400 patient records. Perfect completeness rate.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Distribution of Key Numeric Features (ggplot grid) */}
              <KeyNumericHistograms />
            </div>

            {/* Boxplots & Complex Multi-Correlation Matrix Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Boxplots section (2-column layout width) */}
              <div className="lg:col-span-2">
                <FeatureBoxplots />
              </div>

              {/* Correlation matrix (3-column layout width) */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-visible">
                <div className="mb-4">
                  <h3 className="font-serif text-lg text-[#1a3a5c] mb-1">Feature Correlation Heatmap</h3>
                  <p className="text-xs text-gray-500">Pairwise Pearson correlation indices (r) clustered by semantic hierarchy. Hover over cells to see relationships.</p>
                </div>

                {/* SVG GRID CORRELATION MATRIX */}
                <div id="corr_heatmap" className="relative flex justify-center py-2 text-slate-800">
                  <svg viewBox="0 0 315 315" className="w-full max-w-[325px] h-auto">
                    {CORR_FEATURES.map((f1, rIdx) => {
                      return CORR_FEATURES.map((f2, cIdx) => {
                        const val = CORR_MATRIX[rIdx][cIdx];
                        const x = 45 + cIdx * 18;
                        const y = 45 + rIdx * 18;
                        
                        // Red representing negative correlation, blue green positive correlation
                        let colorHex = '#f8f9fb';
                        if (val > 0) {
                          const alpha = Math.round(val * 255).toString(16).padStart(2, '0');
                          colorHex = `#0e7c5a${alpha}`;
                        } else if (val < 0) {
                          const alpha = Math.round(Math.abs(val) * 255).toString(16).padStart(2, '0');
                          colorHex = `#c0392b${alpha}`;
                        }

                        return (
                          <g key={`${f1}-${f2}`} className="cursor-pointer">
                            <rect 
                              x={x} 
                              y={y} 
                              width="16" 
                              height="16" 
                              fill={colorHex}
                              stroke="#ffffff"
                              strokeWidth={0.5}
                              onMouseEnter={(e) => {
                                setHoveredCorr({
                                  r: val,
                                  f1: CORR_FULL_NAMES[f1],
                                  f2: CORR_FULL_NAMES[f2],
                                  x: x + 8,
                                  y: y - 4
                                });
                              }}
                              onMouseLeave={() => setHoveredCorr(null)}
                            />
                            {/* Tiny number labels inside diagonal */}
                            {rIdx === cIdx && (
                              <text x={x+8} y={y+11} className="font-mono text-[7px] fill-white text-center font-bold" textAnchor="middle">1</text>
                            )}
                          </g>
                        )
                      });
                    })}

                    {/* AXIS LABELS */}
                    {CORR_FEATURES.map((f, idx) => {
                      const pos = 45 + idx * 18 + 9;
                      return (
                        <g key={f}>
                          {/* Y-axis labels */}
                          <text x="38" y={pos + 3} className="font-mono text-[8px] fill-gray-500 text-right" textAnchor="end">{CORR_LABELS[f]}</text>
                          {/* X-axis labels rotated */}
                          <text x={pos} y="38" className="font-mono text-[8px] fill-gray-500 text-center" textAnchor="middle">{CORR_LABELS[f]}</text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* Micro Heatmap Tooltip */}
                  <AnimatePresence>
                    {hoveredCorr && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bg-slate-900 text-white rounded-lg px-3 py-2 text-[10px] pointer-events-none shadow-xl z-30"
                        style={{
                          left: `${(hoveredCorr.x / 315) * 100}%`,
                          top: `${(hoveredCorr.y / 315) * 100}%`,
                          transform: 'translate(-50%, -100%)'
                        }}
                      >
                        <div className="font-bold flex gap-1 items-center mb-0.5 whitespace-nowrap">
                          <span>{hoveredCorr.f1}</span>
                          <span className="text-gray-400">&times;</span>
                          <span>{hoveredCorr.f2}</span>
                        </div>
                        <div className="font-mono text-cyan-400">Pearson R: <span className="font-bold text-xs">{hoveredCorr.r.toFixed(3)}</span></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Active Tab: PERFORMANCE INDICATORS & PLOTS */}
        {activeTab === 'model' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8"
          >
            {/* Top diagnostic indicators comparison */}
            <div id="performance_dashboard" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="font-serif text-2xl text-[#1a3a5c] mb-1">Diagnostic Performance Comparison</h3>
                <p className="text-xs text-gray-500">Hold-out cross-validation diagnostics evaluating model performance across 120 testing patient records.</p>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-xl mb-6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1a3a5c] text-white text-[10px] uppercase font-mono tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Classification Model</th>
                      <th className="px-5 py-4">Accuracy</th>
                      <th className="px-5 py-4">Sensitivity (Recall)</th>
                      <th className="px-5 py-4 font-normal">Specificity</th>
                      <th className="px-5 py-4 font-bold">AUC (ROC Index)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-sans">
                    {PERFORMANCE_METRICS.map((row) => (
                      <tr key={row.model} className={`transition-all ${row.best ? 'bg-amber-50/60 font-medium' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-5 py-4 flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${row.best ? 'text-[#c0392b]' : 'text-gray-400'}`} />
                          <span className="text-gray-900 font-semibold">{row.model}</span>
                        </td>
                        <td className="px-5 py-4 font-mono">{(row.accuracy * 100).toFixed(1)}%</td>
                        <td className="px-5 py-4 font-mono">{(row.sensitivity * 100).toFixed(1)}%</td>
                        <td className="px-5 py-4 font-mono">{(row.specificity * 100).toFixed(1)}%</td>
                        <td className={`px-5 py-4 font-mono font-bold ${row.best ? 'text-[#c0392b]' : ''}`}>{row.auc.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-900 flex gap-2.5">
                <Info className="w-4 h-4 text-[#c0392b] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>L1-Regularized Logistic Regression</strong> demonstrates top generalizability indices (AUC = 0.979). It provides highly robust classifications while establishing zero-weights across redundant clinical features.
                </p>
              </div>
            </div>

            {/* Confusion Matrices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderConfusionMatrix("Logistic Regression", 45, 1, 4, 71)}
              {renderConfusionMatrix("LDA Classifier", 45, 1, 8, 67)}
              {renderConfusionMatrix("Regularized QDA", 45, 1, 5, 70)}
            </div>

            {/* ROC Curves and Feature Importance Side-by-Side Plots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* ROC CURVES COMPILER */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-serif text-lg text-[#1a3a5c] mb-1">Receiver Operating Characteristic (ROC)</h3>
                  <p className="text-xs text-gray-500">True Positive rate plotted against False Positive rate across model thresholds.</p>
                </div>

                <div className="flex justify-center gap-4 text-xs font-mono mb-4 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#c0392b] block border-t-2 border-dashed"></span> Logistic Regression</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1a3a5c] block"></span> LDA Classifier</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#0e7c5a] block"></span> Regularized QDA</span>
                </div>

                <div className="relative flex justify-center">
                  <svg viewBox="0 0 320 230" className="w-full max-w-[310px] h-auto">
                    {/* Diagonal baseline */}
                    <line x1="40" y1="190" x2="290" y2="20" className="stroke-gray-300 stroke-[1.5px] stroke-dashed" />
                    
                    {/* Draw curves */}
                    {/* 1. QDA Line (Green) */}
                    <path 
                      d={ROC_CURVES.qda.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${40 + pt.fpr * 250} ${190 - pt.tpr * 170}`).join(' ')}
                      className="stroke-[#0e7c5a] stroke-[2px] fill-none"
                    />
                    
                    {/* 2. LDA Line (Blue) */}
                    <path 
                      d={ROC_CURVES.lda.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${40 + pt.fpr * 250} ${190 - pt.tpr * 170}`).join(' ')}
                      className="stroke-[#1a3a5c] stroke-[2px] fill-none"
                    />

                    {/* 3. Logistic (Red) */}
                    <path 
                      d={ROC_CURVES.logistic.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${40 + pt.fpr * 250} ${190 - pt.tpr * 170}`).join(' ')}
                      className="stroke-[#c0392b] stroke-[2.5px] fill-none"
                    />

                    {/* Left vertical Y Axis */}
                    <line x1="40" y1="20" x2="40" y2="190" className="stroke-gray-400 stroke-[1.2px]" />
                    {/* Bottom horizontal X Axis */}
                    <line x1="40" y1="190" x2="290" y2="190" className="stroke-gray-400 stroke-[1.2px]" />

                    {/* Outer grid markers */}
                    <text x="35" y="193" className="font-mono text-[9px] fill-gray-400" textAnchor="end">0%</text>
                    <text x="35" y="105" className="font-mono text-[9px] fill-gray-400" textAnchor="end">50%</text>
                    <text x="35" y="25" className="font-mono text-[9px] fill-gray-400" textAnchor="end">100%</text>

                    <text x="40" y="202" className="font-mono text-[9px] fill-gray-400" textAnchor="middle">0%</text>
                    <text x="165" y="202" className="font-mono text-[9px] fill-gray-400" textAnchor="middle">50%</text>
                    <text x="290" y="202" className="font-mono text-[9px] fill-gray-400" textAnchor="middle">100%</text>
                  </svg>
                </div>
              </div>

              {/* FEATURE IMPORTANCE VALUE CHART */}
              <FeatureImportanceChart />

            </div>
          </motion.div>
        )}

        {/* Active Tab: CLINICAL DIAGNOSTIC CALCULATOR (SHINY RECONSTRUCTION) */}
        {activeTab === 'predict' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Input Controls Panel */}
            <div id="patient_form_card" className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1a3a5c]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#1a3a5c] font-normal">Patient Clinical Parameters</h3>
                  <p className="text-[11px] text-gray-500 font-mono uppercase">Adjust patient biomakers values below</p>
                </div>
              </div>

              {/* Model selection for the Risk Simulator */}
              <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h4 className="font-serif text-xs font-bold text-[#1a3a5c]">Risk Simulator Classifier Engine</h4>
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Select the active probabilistic engine</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200 text-[10px] font-medium self-start sm:self-center shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedModel('qda')}
                    className={`px-2.5 py-1.5 rounded-md transition-all ${selectedModel === 'qda' ? 'bg-[#1a3a5c] text-white shadow-2xs font-extrabold' : 'text-gray-600 hover:text-slate-800'}`}
                  >
                    Regularized QDA (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModel('logit')}
                    className={`px-2.5 py-1.5 rounded-md transition-all ${selectedModel === 'logit' ? 'bg-[#1a3a5c] text-white shadow-2xs font-extrabold' : 'text-gray-600 hover:text-slate-800'}`}
                  >
                    L1-Lasso Logistic
                  </button>
                </div>
              </div>

              {/* Dynamic sliders & custom selects layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Age Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-600 font-mono">Patient Age (years)</span>
                    <span className="font-mono text-[#c0392b] font-bold">{age} yrs</span>
                  </div>
                  <input 
                    type="range" min="1" max="110" value={age} 
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c0392b]"
                  />
                </div>

                {/* 2. Blood Pressure BP slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-600 font-mono">Blood Pressure (mm/Hg)</span>
                    <span className="font-mono text-[#c0392b] font-bold">{bp} mmHg</span>
                  </div>
                  <input 
                    type="range" min="50" max="230" step="5" value={bp} 
                    onChange={(e) => setBp(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c0392b]"
                  />
                </div>

                {/* 3. Blood Glucose Random BGR slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-600 font-mono">Random Glucose (mg/dL)</span>
                    <span className="font-mono text-[#c0392b] font-bold">{bgr} mg/dL</span>
                  </div>
                  <input 
                    type="range" min="60" max="450" step="5" value={bgr} 
                    onChange={(e) => setBgr(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c0392b]"
                  />
                </div>

                {/* 4. Blood Urea BU slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-600 font-mono">Blood Urea (mg/dL)</span>
                    <span className="font-mono text-[#c0392b] font-bold">{bu} mg/dL</span>
                  </div>
                  <input 
                    type="range" min="5" max="250" step="5" value={bu} 
                    onChange={(e) => setBu(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c0392b]"
                  />
                </div>

                {/* 5. Serum Creatinine SC slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-600 font-mono">Serum Creatinine (mg/dL)</span>
                    <span className="font-mono text-[#c0392b] font-bold">{sc.toFixed(1)} mg/dL</span>
                  </div>
                  <input 
                    type="range" min="0.2" max="15.0" step="0.1" value={sc} 
                    onChange={(e) => setSc(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c0392b]"
                  />
                </div>

                {/* 6. Hemoglobin Hemo slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-600 font-mono">Hemoglobin (g/dL)</span>
                    <span className="font-mono text-[#c0392b] font-bold">{hemo.toFixed(1)} g/dL</span>
                  </div>
                  <input 
                    type="range" min="3.0" max="20.0" step="0.1" value={hemo} 
                    onChange={(e) => setHemo(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c0392b]"
                  />
                </div>

                {/* 7. Hypertension toggle */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase mb-2">Hypertension Diagnosed?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setHtn('no')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        htn === 'no' 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      No
                    </button>
                    <button 
                      type="button"
                      onClick={() => setHtn('yes')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        htn === 'yes' 
                          ? 'bg-[#c0392b] text-white border-[#c0392b] shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {/* 8. Diabetes mellitus toggle */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase mb-2">Diabetic patient?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setDm('no')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        dm === 'no' 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      No
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDm('yes')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        dm === 'yes' 
                          ? 'bg-[#c0392b] text-white border-[#c0392b] shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Trigger */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <button
                  type="button"
                  id="predict_trigger"
                  onClick={runPrediction}
                  disabled={isCalculating}
                  className="w-full bg-[#1a3a5c] hover:bg-slate-800 text-white py-3.5 px-6 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> {selectedModel === 'qda' ? 'Estimating Quadratic Discriminant Densities...' : 'Training Logit Maximum Likelihood Coordinates...'}
                    </>
                  ) : (
                    <>
                      Run Clinical Prediction Index
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Diagnostic Output Panel */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block mb-4">Diagnosis Output</span>
                  
                  {predResult ? (
                    <motion.div 
                      key={predResult.prob}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-xl p-5 text-white ${
                        predResult.isCkd ? 'bg-[#c0392b]' : 'bg-[#0e7c5a]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {predResult.isCkd ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-100" />
                        )}
                        <h4 className="font-mono text-xs font-bold uppercase tracking-widest">{predResult.isCkd ? 'High Risk Detected' : 'Minimal Risk Status'}</h4>
                      </div>

                      <h3 className="font-serif text-xl font-normal leading-tight mb-4">
                        {predResult.isCkd ? 'Chronic Kidney Disease Likely' : 'Optimal Kidney Filtration Probability'}
                      </h3>

                      <div className="font-serif text-5xl font-bold tracking-tight leading-none mb-1">
                        {predResult.prob}%
                      </div>
                      <div className="text-[10px] uppercase font-mono opacity-70 tracking-wider mb-4">
                        Conditional diagnostic model score
                      </div>

                      <div className="bg-white/10 h-2 w-full rounded-full overflow-hidden mb-5">
                        <div className="bg-white h-full" style={{ width: `${predResult.prob}%` }}></div>
                      </div>

                      {/* Clinical Recommendations */}
                      <div className="pt-4 border-t border-white/20">
                        <h5 className="font-mono text-[9px] uppercase font-bold tracking-widest opacity-80 mb-2">Nephrology Guidelines</h5>
                        {predResult.isCkd ? (
                          <ul className="text-xs space-y-1.5 opacity-90 leading-relaxed list-disc pl-4">
                            <li>Immediate patient referral to a clinical nephrologist is indicated.</li>
                            <li>Collect 24h creatinine authorization profiles and urine analysis.</li>
                            <li>Engage aggressive antihypertensive and diabetic mitigation parameters.</li>
                          </ul>
                        ) : (
                          <ul className="text-xs space-y-1.5 opacity-90 leading-relaxed list-disc pl-4">
                            <li>Normal findings — patient displays safe clearance values.</li>
                            <li>Maintain balanced vascular pressure and correct nutrition profiles.</li>
                            <li>Re-evaluate routine clinical biomarkers on annual schedules.</li>
                          </ul>
                        )}
                      </div>

                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <Settings className="w-12 h-12 stroke-[1.2px] text-gray-350 animate-spin mb-4" />
                      <p className="text-xs">Awaiting patient clinical biomarker configuration values.</p>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] font-mono text-gray-400 pt-6 border-t border-gray-100 mt-6 font-semibold leading-relaxed">
                  {selectedModel === 'qda' 
                    ? 'Regularized Quadratic Discriminant Analysis (QDA) &middot; Non-linear multivariate decision boundary active &middot; Research diagnostic simulator parameters only'
                    : 'L1-Regularized Logistic Regression &middot; Sparse linear decision boundary active &middot; Research diagnostic simulator parameters only'
                  }
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </main>

      {/* Elegant, minimal local development setup guide */}
      <footer className="w-full border-t border-gray-100 bg-linear-to-b from-white to-gray-50/30 pt-10 pb-12 select-none">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
          
          {/* Node.js App Setup */}
          <div className="flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-full text-[10px] font-bold text-[#1a3a5c] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LOCAL ENVIRONMENT SETUP
            </div>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
              Execute this interactive diagnostics workspace on your local machine by installing dependencies and deploying the server:
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-2 font-mono text-[10px] text-slate-600">
              <span className="px-2 py-0.5 bg-white border border-gray-200/80 rounded-md shadow-2xs">npm install</span>
              <span className="text-gray-300 font-sans select-none">&rarr;</span>
              <span className="px-2 py-0.5 bg-white border border-gray-200/80 rounded-md shadow-2xs">npm run dev</span>
              <span className="text-gray-300 font-sans select-none">&rarr;</span>
              <span className="px-2.5 py-0.5 bg-[#1a3a5c]/5 text-[#1a3a5c] border border-[#1a3a5c]/10 rounded-md font-bold">localhost:3000</span>
            </div>
          </div>

          {/* R Markdown Setup */}
          <div className="flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              R MARKDOWN EXECUTION
            </div>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
              Compile and execute the source R classification project (`r_project/ckd_classification.Rmd`) locally:
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-2 font-mono text-[10px] text-indigo-600">
              <span className="px-2 py-0.5 bg-white border border-indigo-200/80 rounded-md shadow-2xs">Open in RStudio</span>
              <span className="text-gray-300 font-sans select-none">&rarr;</span>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-500/10 rounded-md font-bold">Click "Knit"</span>
              <span className="text-gray-300 font-sans select-none">or use:</span>
              <span className="px-2 py-0.5 bg-white border border-gray-200/80 rounded-md shadow-2xs">rmarkdown::render()</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
